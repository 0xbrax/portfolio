import * as THREE from "three";
import EventEmitter from "./EventEmitter.js";
import Config from "./Config.js";
import Loader from "./Loader.js";
import World from "./World.js";
import { DEBUG } from "@/experience/Debug.js";
import { useSettingStore } from "@/store/setting.js";
import Stats from 'stats.js'



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
            this.audioMixer();
            this.start();
        }, { once: true });
        this.loader.on('error', ({ detail }) => {
            console.error(`ERROR --> ${detail.error}`);
        }, { once: true });
    }

    audioMixer() {
        this.assets.sounds.background.volume(1);
        this.assets.sounds.background.loop(true);

        this.assets.sounds.planeIdleFX.volume(0.5);
        this.assets.sounds.planeIdleFX.loop(true);
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
                this.world.planet.on('newPlanetWorkerComplete', ({ detail }) => {
                    const selectedPoints = detail.selectedPoints;
                    this.world.interestPoints.instanceGroup.children.forEach((object, i) => {
                        this.world.interestPoints.setSphericalPosition(object, selectedPoints[i]);
                    });
                    this.world.clouds.generateNewClouds();

                    this.emit('newPlanetReady');

                    window.requestAnimationFrame(() => {
                        this.isReady = true;
                    });
                });

                this.emit('loaded');
                this.tick(); // render takes few milliseconds because of pre-rendered elements, it's after emit to catch first intersectInterest
                this.isReady = true;

                console.timeEnd('t FINAL RENDER')

                ////////
                // DEBUG
                if (window.location.hash === '#debug') {
                    this.DEBUG = DEBUG();

                    this.STATS = new Stats();
                    this.STATS.showPanel(0); // 0 --> FPS
                    document.body.appendChild(this.STATS.dom);
                }
                ////////
            });
        }, { once: true });
    }

    generateNewPlanet(seed) {
        this.isReady = false;
        this.world.planet.generateNewPlanet(seed);
    }

    tick() {
        if (this.STATS) this.STATS.begin();

        this.elapsedTime = this.clock.getElapsedTime();
        this.deltaTime = this.elapsedTime - this.previousTime;
        this.previousTime = this.elapsedTime;

        this.world.update();

        if (!this.world.isFPVActive) this.config.controls.update();

        this.config.renderer.render(this.config.scene, this.config.camera);

        if (this.STATS) this.STATS.end();

        window.requestAnimationFrame(() => {
            this.tick();
        });
    }



    destroy() {
        // clean up not once events
        this.off('newPlanetReady');
        this.loader.off('progress');
        this.world.off('intersectInterest');
        this.world.off('unIntersectInterest');
        this.world.planet.off('newPlanetWorkerComplete');

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