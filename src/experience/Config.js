import * as THREE from "three";
import Experience from "./Experience.js";
import { OrbitControls } from "three/addons";



export default class Config {
    constructor() {
        this.experienceInstance = new Experience();

        this.scene = new THREE.Scene();
        this.setSize();
        this.setCamera();
        this.setRenderer();
        this.setControl();
    }

    setSize() {
        const rect = this.experienceInstance.container.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        this.pixelRatio = Math.min(window.devicePixelRatio, 2);
    }

    setRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: this.pixelRatio !== 1,
            //alpha: true
        });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(this.pixelRatio);
        this.experienceInstance.container.appendChild(this.renderer.domElement);

        //this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        //this.renderer.toneMappingExposure = 1.5;
        this.renderer.setClearColor('#424242');
    }

    setCamera() {
        this.camera = new THREE.PerspectiveCamera(35, this.width / this.height, 0.1, 100);
        this.camera.position.set(12, 4, 8);

        this.scene.add(this.camera);
    }

    setControl() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        //this.controls.enablePan = false;
        //this.controls.rotateSpeed = 0.5;
        //this.controls.minDistance = 1;
        //this.controls.maxDistance = 10;
    }

    resize() {
        this.setSize();

        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(this.pixelRatio);
        this.renderer.antialias = this.pixelRatio !== 1;
    }
}