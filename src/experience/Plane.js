import * as THREE from "three";
import Experience from "@/experience/Experience.js";

export default class Plane {
    constructor() {
        this.experienceInstance = new Experience();
        this.instanceGroup = new THREE.Group();
        this.experienceInstance.world.planet.instanceGroup.add(this.instanceGroup);

        this.subInstanceGroup = new THREE.Group();
        this.subInstanceGroup.position.y = 7;
        this.subInstanceGroup.rotation.reorder('ZYX');
        this.subInstanceGroup.rotation.y = Math.PI * 0.5;
        this.instanceGroup.add(this.subInstanceGroup);

        this.createOrbit();
        this.createPlane();
        this.createDuck();
    }

    createOrbit() {
        const geometry = new THREE.CircleGeometry(8.5, 6);
        const material = new THREE.MeshBasicMaterial({ color: '#00ff00', side: THREE.DoubleSide, wireframe: true });

        this.orbit = new THREE.Mesh(geometry, material);

        this.orbit.visible = false;
        this.instanceGroup.add(this.orbit);
    }

    createPlane() {
        this.model = this.experienceInstance.assets.models.plane.scene;
        this.model.scale.setScalar(7);

        this.subInstanceGroup.add(this.model);

        this.createAnimation();
    }

    createAnimation() {
        this.animation = {};
        this.animation.mixer = new THREE.AnimationMixer(this.model);
        this.animation.mixer.timeScale = 0.5;
        const clip = this.experienceInstance.assets.models.plane.animations[3];

        this.animation.action = this.animation.mixer.clipAction(clip);
        this.animation.action.play();
    }

    createDuck() {
        this.subModel = this.experienceInstance.assets.models.duck.scene;
        this.subModel.scale.setScalar(0.11);

        this.subModel.position.z = 0.345;
        this.subModel.position.y = 0.575;

        this.subInstanceGroup.add(this.subModel);
    }
}