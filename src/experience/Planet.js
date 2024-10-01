import * as THREE from "three";
import Experience from "@/experience/Experience.js";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import { GPUComputationRenderer } from "three/addons";

import terrainPositionsShader from "@/shaders/gpgpu/terrainPositions.glsl";
import terrainVertexShader from "@/shaders/terrain/vertex.glsl";
import terrainFragmentShader from "@/shaders/terrain/fragment.glsl";



export default class Planet {
    constructor() {
        this.experienceInstance = new Experience();
        this.instanceGroup = new THREE.Group();
        this.instanceGroup.position.y = -2;
        this.experienceInstance.config.scene.add(this.instanceGroup);
        
        this.createPlanet();
    }

    createPlanet() {
        // TODO check inset shadows & all geometries attributes not used
        let geometry = new THREE.IcosahedronGeometry(3, 30);
        geometry = mergeVertices(geometry);
        geometry.computeTangents();
        geometry.deleteAttribute('uv');



        const debugObject = {};
        debugObject.colorWaterDeep = '#2a5fc5';
        debugObject.colorWaterSurface = '#35cdff';
        debugObject.colorSand = '#ffe894';
        debugObject.colorGrass = '#85d534';
        debugObject.colorRock = '#bfbd8d';
        debugObject.colorSnow = '#ffffff';
    
        let uniformsObject = {
            uPositionFrequency: new THREE.Uniform(0.5),
            uStrength: new THREE.Uniform(0.6)
        };
        
    

        // sync GPU data with CPU
        const gpgpu = {};
        gpgpu.count = geometry.attributes.position.count;
        gpgpu.size = Math.ceil(Math.sqrt(gpgpu.count));
        gpgpu.computation = new GPUComputationRenderer(gpgpu.size, gpgpu.size, this.experienceInstance.config.renderer);
    
        const positionsTexture = gpgpu.computation.createTexture();
        for (let i = 0; i < gpgpu.count; i++) {
            const i3 = i * 3; // xyz
            const i4 = i * 4; // rgba
    
            positionsTexture.image.data[i4] = geometry.attributes.position.array[i3];
            positionsTexture.image.data[i4 + 1] = geometry.attributes.position.array[i3 + 1];
            positionsTexture.image.data[i4 + 2] = geometry.attributes.position.array[i3 + 2];
            positionsTexture.image.data[i4 + 3] = 0; // data channel will be used for wobble value
        }

        gpgpu.positionsVariable = gpgpu.computation.addVariable('uPositionsTexture', terrainPositionsShader, positionsTexture);

        gpgpu.positionsVariable.material.uniforms = {
            ...uniformsObject,
            uResolution: new THREE.Uniform(new THREE.Vector2(gpgpu.size, gpgpu.size))
        };

        gpgpu.computation.setVariableDependencies(gpgpu.positionsVariable, [gpgpu.positionsVariable]);

        // Init
        gpgpu.computation.init();
        gpgpu.computation.compute();

        ////////
        // DEBUG
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

        // update CPU data with GPU texture data
        const originalPositionsArray = new Float32Array(gpgpu.count * 3);
        const positionsArray = new Float32Array(gpgpu.size * gpgpu.size * 4);
        const wobblesArray = new Float32Array(gpgpu.count);

        this.experienceInstance.config.renderer.readRenderTargetPixels(
            gpgpu.computation.getCurrentRenderTarget(gpgpu.positionsVariable),
            0, 0, gpgpu.size, gpgpu.size,
            positionsArray
        );

        for (let i = 0; i < gpgpu.count; i++) {
            const i3 = i * 3; // xyz
            const i4 = i * 4; // rgba

            const x = positionsArray[i4]; // r
            const y = positionsArray[i4 + 1]; // g
            const z = positionsArray[i4 + 2]; // b
            const w = positionsArray[i4 + 3]; // a

            originalPositionsArray[i3] = x;
            originalPositionsArray[i3 + 1] = y;
            originalPositionsArray[i3 + 2] = z;

            geometry.attributes.position.array[i3] = x;
            geometry.attributes.position.array[i3 + 1] = y;
            geometry.attributes.position.array[i3 + 2] = z;
            wobblesArray[i] = w;
        }
        geometry.setAttribute('aOriginalPosition', new THREE.BufferAttribute(originalPositionsArray, 3));
        geometry.attributes.position.needsUpdate = true;
        geometry.setAttribute('aWobble', new THREE.BufferAttribute(wobblesArray, 1));



        uniformsObject = {
            ...uniformsObject,
            
            uColorWaterDeep: new THREE.Uniform(new THREE.Color(debugObject.colorWaterDeep)),
            uColorWaterSurface: new THREE.Uniform(new THREE.Color(debugObject.colorWaterSurface)),
            uColorSand: new THREE.Uniform(new THREE.Color(debugObject.colorSand)),
            uColorGrass: new THREE.Uniform(new THREE.Color(debugObject.colorGrass)),
            uColorRock: new THREE.Uniform(new THREE.Color(debugObject.colorRock)),
            uColorSnow: new THREE.Uniform(new THREE.Color(debugObject.colorSnow))
        };

        const material = new CustomShaderMaterial({
            baseMaterial: THREE.MeshStandardMaterial,
            vertexShader: terrainVertexShader,
            fragmentShader: terrainFragmentShader,
            uniforms: uniformsObject,
            ////////
            color: debugObject.colorGrass,
            metalness: 0,
            roughness: 0.5,
            //wireframe: false
        });

        this.model = new THREE.Mesh(
            geometry,
            material
        );

        gpgpu.computation.dispose();

    
    
        const water = new THREE.Mesh(
            new THREE.IcosahedronGeometry(3, 15),
            new THREE.MeshPhysicalMaterial({
                color: debugObject.colorWaterSurface,
                transmission: 1,
                roughness: 0.3,
                //transparent: true,
                //opacity: 0.75
            })
        );
        //water.visible = false;
        
        

        this.instanceGroup.add(this.model, water);
    }
}