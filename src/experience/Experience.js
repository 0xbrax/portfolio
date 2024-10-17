import * as THREE from "three";
import EventEmitter from "./EventEmitter.js";
import Config from "./Config.js";
import Loader from "./Loader.js";
import World from "./World.js";
import { DEBUG } from "@/experience/Debug.js";



let instance = null;

export default class Experience extends EventEmitter {
    constructor(container, loading, resources, interestPoints, seed) {
        if (instance) return instance;
        super();
        instance = this;

        this.isReady = false;

        this.container = container;
        //this.loading = loading;
        this.resources = resources;
        this.interestPoints = interestPoints;
        this.seed = seed; // good result between -1000 and 1000



        this.config = new Config();
        this.loader = new Loader();
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

    updateSeed(seed) {
        this.seed;
    }

    init() {
        this.loader.start();
        this.loader.on('complete', () => {
            this.assets = this.loader.assets;

            this.start();
        }, { once: true });
        this.loader.on('error', (e) => {
            // TODO fix and handle message
            console.log(`Asset load error: ${JSON.stringify(e)}`);
        }, { once: true });
    }

    start() {
        this.world = new World();

        this.world.on('loadComplete', () => {
            console.time('t FINAL RENDER')

            window.requestAnimationFrame(() => {
                ////////
                if (window.location.hash === '#debug') this.DEBUG = DEBUG();
                ////////

                this.emit('loaded');
                this.tick();
                this.isReady = true;

                console.timeEnd('t FINAL RENDER')
            });
        }, { once: true });
    }

    tick() {
        this.elapsedTime = this.clock.getElapsedTime();
        this.deltaTime = this.elapsedTime - this.previousTime;
        this.previousTime = this.elapsedTime;

        this.world.update();

        if (!this.world.isFPVActive) this.config.controls.update();
        this.config.renderer.render(this.config.scene, this.config.camera);
        window.requestAnimationFrame(() => {
            this.tick();
        });
    }



    destroy() {
        // TODO not once events clean up using off

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