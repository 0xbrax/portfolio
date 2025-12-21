import * as THREE from 'three';
import Experience from '@/experience/Experience.js';
import {mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
import CustomShaderMaterial from 'three-custom-shader-material/vanilla';
import {GPUComputationRenderer} from 'three/addons';
import EventEmitter from '@/experience/EventEmitter.js';

import terrainPositionsShader from '@/shaders/gpgpu/terrainPositions.glsl';
import terrainVertexShader from '@/shaders/terrain/vertex.glsl';
import terrainFragmentShader from '@/shaders/terrain/fragment.glsl';
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
    this.debugObject.colorWaterFoam = '#84eaff';
    this.debugObject.colorSand = '#ffe894';
    this.debugObject.colorGrass = '#85d534';
    this.debugObject.colorRock = '#bfbd8d';
    this.debugObject.colorSnow = '#ffffff';

    this.createWater();
    this.createPlanet(this.experienceInstance.seed, true);

    // if it uses shadows provide customDepthMaterial
  }

  createPlanet(seed, isInit) {
    const worker = new Worker(new URL('../worker/planetWorker.js', import.meta.url));

    let geometry = new THREE.IcosahedronGeometry(this.sphereRadius, 30);
    geometry = mergeVertices(geometry);
    geometry.computeTangents();
    geometry.deleteAttribute('uv');

    if (window.location.hash === '#debug' && !this.debugPlanetInfo) {
      this.debugPlanetInfo = document.createElement('div');
      this.debugPlanetInfo.id = 'debug-planet-info';
      this.debugPlanetInfo.className = 'p-2 bg-white/50 text-black pointer-events-none text-sm text-right';
      this.debugPlanetInfo.innerHTML = `
                Planet position count</br>
                 
                <span>${geometry.attributes.position.count}</span>  
            `;
      document.body.appendChild(this.debugPlanetInfo);
    }

    let uniformsObject = {
      uPositionFrequency: new THREE.Uniform(0.5),
      uSeed: new THREE.Uniform(seed),
      uStrength: new THREE.Uniform(0.6),
    };

    // sync GPU data with CPU
    this.gpgpu = {};
    this.gpgpu.count = geometry.attributes.position.count;
    this.gpgpu.size = Math.ceil(Math.sqrt(this.gpgpu.count));
    this.gpgpu.computation = new GPUComputationRenderer(this.gpgpu.size, this.gpgpu.size, this.experienceInstance.config.renderer);
    const positionsTexture = this.gpgpu.computation.createTexture();
    const positionsGeometryArray = geometry.attributes.position.array;
    const positionsTextureArray = positionsTexture.image.data;

    /*this.gpgpu.debug2 = new THREE.Mesh(
        new THREE.PlaneGeometry(3, 3),
        new THREE.MeshBasicMaterial({
            map: positionsTexture//this.gpgpu.computation.getCurrentRenderTarget(this.gpgpu.positionsVariable).texture
            // transparent: true
        })
    );
    this.gpgpu.debug2.position.x = 5;
    this.gpgpu.debug2.position.y = 2;
    this.experienceInstance.config.scene.add(this.gpgpu.debug2);*/


    worker.postMessage({
      step: 1,
      gpgpuCount: this.gpgpu.count,
      positionsGeometryBuffer: positionsGeometryArray.buffer,
      positionsTextureBuffer: positionsTextureArray.buffer,
    }, [positionsGeometryArray.buffer, positionsTextureArray.buffer]);

    worker.onmessage = (event) => {
      const {step} = event.data;

      if (step === 1) {
        const {positionsTextureBuffer} = event.data;
        const positionsTextureArray = new Float32Array(positionsTextureBuffer);

        positionsTexture.image.data = positionsTextureArray;
        this.gpgpu.positionsVariable = this.gpgpu.computation.addVariable('uPositionsTexture', terrainPositionsShader, positionsTexture);
        this.gpgpu.positionsVariable.material.uniforms = {
          ...uniformsObject,
          uResolution: new THREE.Uniform(new THREE.Vector2(this.gpgpu.size, this.gpgpu.size)),
        };
        this.gpgpu.computation.setVariableDependencies(this.gpgpu.positionsVariable, [this.gpgpu.positionsVariable]);

        // Init & Compute
        this.gpgpu.computation.init();
        this.gpgpu.computation.compute();

        // update CPU data with GPU texture data
        const positionsArray = new Float32Array(this.gpgpu.size * this.gpgpu.size * 4);
        const originalPositionsArray = new Float32Array(this.gpgpu.count * 3);
        const elevationsArray = new Float32Array(this.gpgpu.count);

        this.experienceInstance.config.renderer.readRenderTargetPixels(
          this.gpgpu.computation.getCurrentRenderTarget(this.gpgpu.positionsVariable),
          0, 0, this.gpgpu.size, this.gpgpu.size,
          positionsArray,
        );


        worker.postMessage({
          step: 2,
          positionsBuffer: positionsArray.buffer,
          originalPositionsBuffer: originalPositionsArray.buffer,
          elevationsBuffer: elevationsArray.buffer,
          sphereRadius: this.sphereRadius,
          interestPointsLength: this.interestPointsLength,
        }, [positionsArray.buffer, originalPositionsArray.buffer, elevationsArray.buffer]);

        return;
      }


      // step 2
      const {originalPositionsBuffer, positionsGeometryBuffer, elevationsBuffer, selectedPoints} = event.data;
      const originalPositionsArray = new Float32Array(originalPositionsBuffer);
      const positionsGeometryArray = new Float32Array(positionsGeometryBuffer);
      const elevationsArray = new Float32Array(elevationsBuffer);

      geometry.attributes.position.array = positionsGeometryArray;
      geometry.attributes.position.needsUpdate = true;
      geometry.setAttribute('aOriginalPosition', new THREE.BufferAttribute(originalPositionsArray, 3));
      geometry.setAttribute('aElevation', new THREE.BufferAttribute(elevationsArray, 1));


      ////////
      // DEBUG TODO debug texture is with original data, not new data
      /*if (window.location.hash === '#debug') {
          console.log('LOG - - -', this.gpgpu.computation);

          this.gpgpu.debug = new THREE.Mesh(
              new THREE.PlaneGeometry(3, 3),
              new THREE.MeshBasicMaterial({
                  map: this.gpgpu.computation.getCurrentRenderTarget(this.gpgpu.positionsVariable).texture
                  // transparent: true
              })
          );
          this.gpgpu.debug.position.x = -5;
          this.gpgpu.debug.position.y = 2;
          this.experienceInstance.config.scene.add(this.gpgpu.debug);
      } else {
          this.gpgpu.computation.dispose(); // remove gpgpu dispose to debug
      }*/
      ////////

      this.gpgpu.computation.dispose();


      uniformsObject = {
        ...uniformsObject,

        uColorWaterDeep: new THREE.Uniform(new THREE.Color(this.debugObject.colorWaterDeep)),
        uColorWaterSurface: new THREE.Uniform(new THREE.Color(this.debugObject.colorWaterSurface)),
        uColorSand: new THREE.Uniform(new THREE.Color(this.debugObject.colorSand)),
        uColorGrass: new THREE.Uniform(new THREE.Color(this.debugObject.colorGrass)),
        uColorRock: new THREE.Uniform(new THREE.Color(this.debugObject.colorRock)),
        uColorSnow: new THREE.Uniform(new THREE.Color(this.debugObject.colorSnow)),
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
        wireframe: window.location.hash === '#debug',
      });

      this.model = new THREE.Mesh(
        geometry,
        material,
      );


      this.instanceGroup.add(this.model);
      this.experienceInstance.updateSeed(seed);

      if (isInit) {
        this.emit('workerComplete', {selectedPoints});
      } else {
        this.emit('newPlanetWorkerComplete', {selectedPoints});
      }
    };
  }

  createWater() {
    const geometry = new THREE.IcosahedronGeometry(3 + 0.0024, 30);

    const uniformsObject = {
      uTime: new THREE.Uniform(0),
      uStrength: new THREE.Uniform(0.02),
      uColorWaterSurface: new THREE.Uniform(new THREE.Color(this.debugObject.colorWaterSurface)),
      uColorWaterFoam: new THREE.Uniform(new THREE.Color(this.debugObject.colorWaterFoam)),
    };

    const material = new CustomShaderMaterial({
      baseMaterial: THREE.MeshPhysicalMaterial,
      vertexShader: waterVertexShader,
      fragmentShader: waterFragmentShader,
      uniforms: uniformsObject,
      ////////
      transmission: 1,
      roughness: 0.3,
      wireframe: window.location.hash === '#debug',
    });


    this.subModel = new THREE.Mesh(geometry, material);

    this.instanceGroup.add(this.subModel);
  }


  destroyPlanet() {
    this.instanceGroup.remove(this.model);
    this.model.material.dispose();
    this.model.geometry.dispose();
    this.model = null;

    /*if (window.location.hash === '#debug') {
        this.gpgpu.debug.geometry.dispose();
        this.gpgpu.debug.material.dispose();
        this.experienceInstance.config.scene.remove(this.gpgpu.debug);
        this.gpgpu.debug = null;

        this.gpgpu.computation.dispose();
    }*/
  }

  generateNewPlanet(seed) {
    this.destroyPlanet();

    window.requestAnimationFrame(() => {
      this.createPlanet(seed, false);
    });
  }
}