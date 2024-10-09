import * as THREE from "three";
import EventEmitter from "./EventEmitter.js";
import Config from "./Config.js";
import Loader from "./Loader.js";
import World from "./World.js";
import { DEBUG } from "@/experience/Debug.js";



let instance = null;

export default class Experience extends EventEmitter {
    constructor(container, loading) {
        if (instance) return instance;
        super();
        instance = this;

        this.isReady = false;

        this.container = container;
        //this.loading = loading;

        const RESOURCES = {
            fonts: [
                {
                    name: 'regular',
                    type: 'font',
                    path: 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json'
                }
            ],
            models: [
                {
                    name: 'robot',
                    type: 'gltf',
                    path: '/models/cute-bot_compressed.glb'
                },
                {
                    name: 'plane',
                    type: 'gltf',
                    path: '/models/plane_edit_compressed.glb'
                },
                {
                    name: 'duck',
                    type: 'gltf',
                    path: '/models/rubber-duck_compressed.glb'
                }
            ]
        };

        this.config = new Config();
        this.loader = new Loader(RESOURCES);
        this.assets = null;
        this.world = null;

        this.clock = new THREE.Clock();
        this.elapsedTime = 0;
        this.previousTime = 0;
        this.deltaTime = 16;

        ////////
        this.init();

        window.addEventListener('resize', () => {
            this.config.resize();
        });
    }

    init() {
        this.tick();

        this.loader.start();
        this.loader.on('complete', () => {
            this.assets = this.loader.assets;
            this.world = new World();

            this.start();

            this.emit('loaded');
        }, { once: true });
        this.loader.on('error', (e) => {
            // TODO fix and handle message
            console.log(`Asset load error: ${JSON.stringify(e)}`);
        }, { once: true });
    }

    start() {
        this.world.start();
        // current target is scene center (x: 0, y: 0, z: 0)
        //this.config.controls.target.copy(this.world....position.clone());

        this.isReady = true;

        ////////
        this.DEBUG = DEBUG(true);
    }

    tick() {
        this.elapsedTime = this.clock.getElapsedTime();
        this.deltaTime = this.elapsedTime - this.previousTime;
        this.previousTime = this.elapsedTime;

        if (this.isReady) this.world.update();

        this.config.controls.update();
        this.config.renderer.render(this.config.scene, this.config.camera);
        window.requestAnimationFrame(() => {
            this.tick();
        });
    }



    destroy() {
        // not once events clean up using off

        this.config.scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose();

                for (const key in child.material) {
                    const value = child.material[key];

                    if (value && typeof value.dispose === 'function') {
                        value.dispose();
                    }
                }
            }
        });

        this.config.controls.dispose();
        this.config.renderer.dispose();

        instance = null;
    }
}