import * as THREE from "three";
import EventEmitter from "./EventEmitter.js";
import Config from "./Config.js";
import Loader from "./Loader.js";
import World from "./World.js";
import { DEBUG } from "@/experience/Debug.js";
import { useSettingStore } from "@/store/setting.js";



let instance = null;

export default class Experience extends EventEmitter {
    constructor(container, resources, interestPoints, seed) {
        if (instance) return instance;
        super();
        instance = this;

        this.isReady = false;

        this.container = container;
        this.resources = resources;
        this.interestPoints = interestPoints;
        this.seed = seed; // good result between -1000 and 1000
        this.assetsLoader = {
            assetsLoaded: null,
            assetsTotal: null,
            workersCount: 0,
            progress: 0
        };
        this.settingStore = useSettingStore();



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
        this.seed = seed;
    }

    init() {
        this.loader.start();

        this.loader.on('progress', ({ detail }) => {
            const { assetsLoaded, assetsTotal } = detail;
            const progress = assetsLoaded / assetsTotal;

            console.log('PROGRESS - - -', progress)
            this.settingStore.loaderProgress = progress;

            this.assetsLoader.assetsLoaded = assetsLoaded;
            this.assetsLoader.assetsTotal = assetsTotal;
            this.assetsLoader.progress = progress;
        });

        this.loader.on('complete', ({ detail }) => {
            const { workersCount } = detail;
            this.assetsLoader.workersCount = workersCount;

            this.assets = this.loader.assets;
            this.start();
        }, { once: true });
        this.loader.on('error', ({ detail }) => {
            console.error(`ERROR --> ${detail.error}`);
        }, { once: true });
    }

    start() {
        this.world = new World();

        this.settingStore.worldSeed = this.seed;

        // wait for worker and pre-render
        this.world.on('loadComplete', () => {
            this.assetsLoader.assetsLoaded++;
            const progress = this.assetsLoader.assetsLoaded / this.assetsLoader.assetsTotal;

            console.log('PROGRESS 2 - - -', progress)
            this.settingStore.loaderProgress = progress;

            this.assetsLoader.progress = progress;

            console.time('t FINAL RENDER')

            window.requestAnimationFrame(() => {
                ////////
                if (window.location.hash === '#debug') this.DEBUG = DEBUG();
                ////////

                this.tick();
                this.isReady = true;
                this.emit('loaded');

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