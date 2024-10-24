import * as THREE from "three";
import Experience from "@/experience/Experience.js";
import { getPseudoRandomInt } from "@/assets/utils.js";

export default class Clouds {
    constructor() {
        this.experienceInstance = new Experience();
        this.instanceGroup = new THREE.Group();
        this.instanceGroup.position.y = -2;
        this.experienceInstance.config.scene.add(this.instanceGroup);

        this.subInstanceGroup = new THREE.Group();
        this.instanceGroup.add(this.subInstanceGroup);

        this.createOrbit();
        this.createClouds();
    }

    createOrbit() {
        const geometry = new THREE.IcosahedronGeometry(7.25, 2);
        const material = new THREE.MeshBasicMaterial({ color: '#00ff00', side: THREE.DoubleSide, wireframe: true });

        this.orbit = new THREE.Mesh(geometry, material);

        this.orbit.visible = false;
        this.instanceGroup.add(this.orbit);
    }

    createClouds() {
        this.clouds = {};
        const cloudsNumber = getPseudoRandomInt(3, 12);

        for (let i = 1; i <= cloudsNumber; i++) {
            let randomIndex = getPseudoRandomInt(0, this.orbit.geometry.attributes.position.count - 1);
            while (randomIndex in this.clouds) {
                randomIndex = getPseudoRandomInt(0, this.orbit.geometry.attributes.position.count - 1);
            }

            const randomIndex3 = randomIndex * 3;

            const x = this.orbit.geometry.attributes.position.array[randomIndex3];
            const y = this.orbit.geometry.attributes.position.array[randomIndex3 + 1];
            const z = this.orbit.geometry.attributes.position.array[randomIndex3 + 2];

            const selectedPoint = { x, y, z };
            const randomCloud = getPseudoRandomInt(1, 3);

            this.clouds[randomIndex] = this.experienceInstance.assets.models[`cloud_${randomCloud}`].scene.clone();
            this.clouds[randomIndex].scale.setScalar(0.2);

            this.setSphericalPosition(this.clouds[randomIndex], selectedPoint);
            this.subInstanceGroup.add(this.clouds[randomIndex]);
        }
    }

    setSphericalPosition(object, selectedPoint) {
        const position = new THREE.Vector3(...Object.values(selectedPoint));
        object.position.copy(position);

        const direction = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), position).normalize();
        const up = new THREE.Vector3(0, -1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
        object.quaternion.copy(quaternion);
    }

    destroyClouds() {
        Object.keys(this.clouds).forEach((key) => {
            this.clouds[key].children.forEach((child) => {
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

            this.subInstanceGroup.remove(this.clouds[key]);
            this.clouds[key] = null;
        });
    }

    generateNewClouds() {
        this.destroyClouds();
        this.createClouds();
    }
}