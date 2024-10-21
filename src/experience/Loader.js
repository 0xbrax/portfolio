import * as THREE from "three";
import { DRACOLoader, GLTFLoader } from "three/addons";
import { Howl } from "howler";
import EventEmitter from "./EventEmitter.js";
import Experience from "./Experience.js";



export default class Loader extends EventEmitter {
    constructor() {
        super();

        this.experienceInstance = new Experience();
        this.resources = this.experienceInstance.resources;
        this.assets = {};
        this.loadingManager = new THREE.LoadingManager();

        this.gltfLoader = new GLTFLoader(this.loadingManager);
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/draco/');
        this.gltfLoader.setDRACOLoader(dracoLoader);
        this.gltfLoader.setCrossOrigin('anonymous');

        this.assetsTotal = null;
        this.assetsLoaded = null;

        this.soundsTotal = this.resources['sounds'] ? this.resources['sounds'].length : 0;
        this.soundsLoaded = 0;
        this.workersCount = 1;

        this.loadingManager.onProgress = (_, itemsLoaded, itemsTotal) => {
            this.assetsLoaded = itemsLoaded;
            this.assetsTotal = itemsTotal + this.workersCount;

            this.emit('progress', { assetsLoaded: this.assetsLoaded, assetsTotal: this.assetsTotal });
        };
        this.loadingManager.onLoad = () => {
            this.emit('complete', { workersCount: this.workersCount });
        };
    }

    onLoadAsset() {
        this.assetsLoaded++;
        this.soundsLoaded++;

        this.emit('progress', { assetsLoaded: this.assetsLoaded, assetsTotal: this.assetsTotal });

        if (this.soundsLoaded === this.soundsTotal) {
            this.loadingManager.onLoad();
        }
    }

    start() {
        for (const key in this.resources) {
            this.assets[key] = {};

            for (const asset of this.resources[key]) {
                this.loadingManager.itemStart(asset.path);

                if (asset.type === 'gltf') {
                    this.gltfLoader.load(asset.path, (file) => {
                        this.assets[key][asset.name] = file;
                        this.loadingManager.itemEnd(asset.path);
                    }, undefined, (error) => {
                        this.emit('error', { error });
                    });
                } else if (asset.type === 'mp3') {
                    const file = new Howl({
                        src: [asset.path],
                        onload: () => {
                            this.assets[key][asset.name] = file;
                            this.onLoadAsset();
                        },
                        onloaderror: (error) => {
                            this.emit('error', { error });
                        }
                    });
                }
            }
        }
    }
}
