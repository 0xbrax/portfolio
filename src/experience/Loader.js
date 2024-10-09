import * as THREE from "three";
import { DRACOLoader, GLTFLoader } from "three/addons";
import EventEmitter from "./EventEmitter.js";
import Experience from "./Experience.js";



export default class Loader extends EventEmitter {
    constructor(resources) {
        super();

        // TODO if it loads gltf only use loading manager progress to better result

        this.experienceInstance = new Experience();
        this.resources = this.experienceInstance.resources;
        this.assets = {};
        this.loadingManager = new THREE.LoadingManager();

        this.textureLoader = new THREE.TextureLoader();
        this.textureLoader.setCrossOrigin('anonymous');
        this.gltfLoader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/draco/');
        this.gltfLoader.setDRACOLoader(dracoLoader);
        this.gltfLoader.setCrossOrigin('anonymous');

        this.totalAssets = 0;
        this.loadedAssets = 0;
        for (const key in this.resources) {
            this.totalAssets += this.resources[key].length;
        }
        this.loadingManager.onError = (url) => {
            const data = { url };
            this.emit('error', data);
        };
        this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
            const progress = itemsLoaded / itemsTotal;

            console.log('LOG - - -', progress)

        };
        this.onLoadAsset = (assetPath) => {
            this.loadingManager.itemEnd(assetPath);
            this.loadedAssets++;

            if (this.loadedAssets === this.totalAssets) {
                this.emit('complete');
            }
        };
    }

    start() {
        for (const key in this.resources) {
            this.assets[key] = {};

            for (const asset of this.resources[key]) {
                this.loadingManager.itemStart(asset.path);

                if (asset.type === 'texture') {
                    this.textureLoader.load(asset.path, (file) => {
                        this.assets[key][asset.name] = file;
                        this.onLoadAsset(asset.path);
                    }, undefined, (e) => {
                        this.loadingManager.itemError(asset.path);
                    });
                } else if (asset.type === 'gltf') {
                    this.gltfLoader.load(asset.path, (file) => {
                        this.assets[key][asset.name] = file;
                        this.onLoadAsset(asset.path);
                    }, undefined, (e) => {
                        this.loadingManager.itemError(asset.path);
                    });
                } else if (asset.type === 'audio') {
                    const sound = new Howl({
                        src: [asset.path],
                        onload: () => {
                            this.assets[key][asset.name] = sound;
                            this.onLoadAsset(asset.path);
                        },
                        onloaderror: (e) => {
                            this.loadingManager.itemError(asset.path);
                        }
                    });
                }
            }
        }
    }
}
