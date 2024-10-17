import * as THREE from "three";
import Experience from "@/experience/Experience.js";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import { GPUComputationRenderer } from "three/addons";
import EventEmitter from "@/experience/EventEmitter.js";

import terrainPositionsShader from "@/shaders/gpgpu/terrainPositions.glsl";
import terrainVertexShader from "@/shaders/terrain/vertex.glsl";
import terrainFragmentShader from "@/shaders/terrain/fragment.glsl";
import waterVertexShader from '@/shaders/water/vertex.glsl';
import waterFragmentShader from '@/shaders/water/fragment.glsl';



export default class Planet extends EventEmitter {
    constructor(interestPointsLength) {
        super();

        this.experienceInstance = new Experience();
        this.instanceGroup = new THREE.Group();
        this.instanceGroup.position.y = -2;
        this.instanceGroup.children.forEach((child) => {
            child.frustumCulled = false;
        });
        this.experienceInstance.config.scene.add(this.instanceGroup);

        this.sphereRadius = 3;
        this.interestPointsLength = interestPointsLength;

        this.debugObject = {};
        this.debugObject.colorWaterDeep = '#2a5fc5';
        this.debugObject.colorWaterSurface = '#35cdff';
        this.debugObject.colorWaterFoam = '#68daff';
        this.debugObject.colorSand = '#ffe894';
        this.debugObject.colorGrass = '#85d534';
        this.debugObject.colorRock = '#bfbd8d';
        this.debugObject.colorSnow = '#ffffff';

        // TODO check inset shadows & all geometries attributes not used
        this.createWater();
        this.createPlanet(this.experienceInstance.seed);
    }

    createPlanet(seed, isNew) {
        const worker = new Worker(new URL('../worker/planetWorker.js', import.meta.url));

        let geometry = new THREE.IcosahedronGeometry(this.sphereRadius, 30);
        geometry = mergeVertices(geometry);
        geometry.computeTangents();
        geometry.deleteAttribute('uv');

        let uniformsObject = {
            uPositionFrequency: new THREE.Uniform(0.5),
            uSeed: new THREE.Uniform(seed),
            uStrength: new THREE.Uniform(0.6)
        };

        // sync GPU data with CPU
        const gpgpu = {};
        gpgpu.count = geometry.attributes.position.count;
        gpgpu.size = Math.ceil(Math.sqrt(gpgpu.count));
        gpgpu.computation = new GPUComputationRenderer(gpgpu.size, gpgpu.size, this.experienceInstance.config.renderer);
        const positionsTexture = gpgpu.computation.createTexture();
        const positionsGeometryArray = geometry.attributes.position.array;
        const positionsTextureArray = positionsTexture.image.data;



        worker.postMessage({
            step: 1,
            gpgpuCount: gpgpu.count,
            positionsGeometryBuffer: positionsGeometryArray.buffer,
            positionsTextureBuffer: positionsTextureArray.buffer
        }, [positionsGeometryArray.buffer, positionsTextureArray.buffer]);

        worker.onmessage = (event) => {
            const { step } = event.data;

            if (step === 1) {
                const { positionsTextureBuffer } = event.data;
                const positionsTextureArray = new Float32Array(positionsTextureBuffer);

                positionsTexture.image.data = positionsTextureArray;
                gpgpu.positionsVariable = gpgpu.computation.addVariable('uPositionsTexture', terrainPositionsShader, positionsTexture);
                gpgpu.positionsVariable.material.uniforms = {
                    ...uniformsObject,
                    uResolution: new THREE.Uniform(new THREE.Vector2(gpgpu.size, gpgpu.size))
                };
                gpgpu.computation.setVariableDependencies(gpgpu.positionsVariable, [gpgpu.positionsVariable]);

                // Init
                gpgpu.computation.init();
                gpgpu.computation.compute();

                // update CPU data with GPU texture data
                const positionsArray = new Float32Array(gpgpu.size * gpgpu.size * 4);
                const originalPositionsArray = new Float32Array(gpgpu.count * 3);
                const wobblesArray = new Float32Array(gpgpu.count);

                this.experienceInstance.config.renderer.readRenderTargetPixels(
                    gpgpu.computation.getCurrentRenderTarget(gpgpu.positionsVariable),
                    0, 0, gpgpu.size, gpgpu.size,
                    positionsArray
                );

                worker.postMessage({
                    step: 2,
                    positionsBuffer: positionsArray.buffer,
                    originalPositionsBuffer: originalPositionsArray.buffer,
                    wobblesBuffer: wobblesArray.buffer,
                    sphereRadius: this.sphereRadius,
                    interestPointsLength: this.interestPointsLength
                }, [positionsArray.buffer, originalPositionsArray.buffer, wobblesArray.buffer]);

                return;
            }



            // step 2
            const { originalPositionsBuffer, positionsGeometryBuffer, wobblesBuffer, selectedPoints } = event.data;
            const originalPositionsArray = new Float32Array(originalPositionsBuffer);
            const positionsGeometryArray = new Float32Array(positionsGeometryBuffer);
            const wobblesArray = new Float32Array(wobblesBuffer);

            geometry.attributes.position.array = positionsGeometryArray;
            geometry.attributes.position.needsUpdate = true;
            geometry.setAttribute('aOriginalPosition', new THREE.BufferAttribute(originalPositionsArray, 3));
            geometry.setAttribute('aWobble', new THREE.BufferAttribute(wobblesArray, 1));

            ////////
            // DEBUG
            ////////
            /*gpgpu.debug = new THREE.Mesh(
                new THREE.PlaneGeometry(3, 3),
                new THREE.MeshBasicMaterial({
                    color: '#00ff00',
                    map: gpgpu.computation.getCurrentRenderTarget(gpgpu.positionsVariable).texture,
                    transparent: true
                })
            );
            gpgpu.debug.position.x = -5;
            gpgpu.debug.position.y = 2;
            this.experienceInstance.config.scene.add(gpgpu.debug); // remove gpgpu dispose to debug*/

            gpgpu.computation.dispose();

            uniformsObject = {
                ...uniformsObject,

                uColorWaterDeep: new THREE.Uniform(new THREE.Color(this.debugObject.colorWaterDeep)),
                uColorWaterSurface: new THREE.Uniform(new THREE.Color(this.debugObject.colorWaterSurface)),
                uColorSand: new THREE.Uniform(new THREE.Color(this.debugObject.colorSand)),
                uColorGrass: new THREE.Uniform(new THREE.Color(this.debugObject.colorGrass)),
                uColorRock: new THREE.Uniform(new THREE.Color(this.debugObject.colorRock)),
                uColorSnow: new THREE.Uniform(new THREE.Color(this.debugObject.colorSnow))
            };

            const material = new CustomShaderMaterial({
                baseMaterial: THREE.MeshStandardMaterial,
                vertexShader: terrainVertexShader,
                fragmentShader: terrainFragmentShader,
                uniforms: uniformsObject,
                ////////
                color: this.debugObject.colorGrass,
                metalness: 0,
                roughness: 0.5,
                //wireframe: false
            });

            this.model = new THREE.Mesh(
                geometry,
                material
            );



            this.instanceGroup.add(this.model);
            this.experienceInstance.updateSeed(seed);

            if (!isNew) {
                this.emit('workerComplete', { selectedPoints });
            } else {
                this.emit('newPlanetWorkerComplete', { selectedPoints });
            }
        };
    }

    createWater() {
        const geometry = new THREE.IcosahedronGeometry(3 + 0.012, 15);

        const uniformsObject = {
            uTime: new THREE.Uniform(0),
            uFrequency: new THREE.Uniform(new THREE.Vector2(3, 1.5)),
            uColorWaterSurface: new THREE.Uniform(new THREE.Color(this.debugObject.colorWaterSurface)),
            uColorWaterFoam: new THREE.Uniform(new THREE.Color(this.debugObject.colorWaterFoam))
        };

        const material = new CustomShaderMaterial({
            baseMaterial: THREE.MeshPhysicalMaterial,
            vertexShader: waterVertexShader,
            fragmentShader: waterFragmentShader,
            uniforms: uniformsObject,
            ////////
            transmission: 1,
            roughness: 0.3,
            //wireframe: false
        });



        this.subModel = new THREE.Mesh(geometry, material);

        this.instanceGroup.add(this.subModel);
    }



    destroyPlanet() {
        this.instanceGroup.remove(this.model);
        this.model.material.dispose();
        this.model.geometry.dispose();
    }

    generateNewPlanet(seed) {
        this.destroyPlanet();

        window.requestAnimationFrame(() => {
            this.createPlanet(seed, true);
        });
    }
}