import * as THREE from "three";
import Experience from "@/experience/Experience.js";

export default class Plane {
    constructor() {
        this.experienceInstance = new Experience();
        this.instanceGroup = new THREE.Group();
        this.instanceGroup.position.y = 3;
        this.experienceInstance.config.scene.add(this.instanceGroup);

        this.createPlane();
        this.createDuck();
    }

    createPlane() {
        this.model = this.experienceInstance.assets.models.plane.scene;
        this.model.scale.setScalar(7);

        this.model.rotation.x = Math.PI * -0.5;
        this.model.rotation.y = Math.PI;

        this.instanceGroup.add(this.model);

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

        this.subModel.rotation.x = Math.PI * -0.5;
        this.subModel.rotation.y = Math.PI;

        this.subModel.position.z = -0.57;
        this.subModel.position.y = -0.345;

        this.instanceGroup.add(this.subModel);
    }
}