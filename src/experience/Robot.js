import * as THREE from "three";
import Experience from "@/experience/Experience.js";

export default class Robot {
    constructor() {
        this.experienceInstance = new Experience();
        this.instanceGroup = new THREE.Group();
        this.experienceInstance.config.scene.add(this.instanceGroup);
        
        this.createRobot();
    }

    createRobot() {
        console.log('LOG - - -', this.experienceInstance.assets.models.robot)

        this.model = this.experienceInstance.assets.models.robot.scene;
        this.model.scale.setScalar(2);
        this.model.position.y = 1;

        this.model.children.forEach((child) => {
            if (child.isMesh) {
                child.frustumCulled = false;
            }
        });

        this.instanceGroup.add(this.model);

        this.createAnimation();
        this.createRaycaster();
    }

    createAnimation() {
        // TODO animations crossfade
        this.animation = {};
        this.animation.mixer = new THREE.AnimationMixer(this.model);
        this.animation.mixer.timeScale = 1;
        const clip = this.experienceInstance.assets.models.robot.animations[4];

        this.animation.action = this.animation.mixer.clipAction(clip);
        this.animation.isPlaying = false;
    }

    createRaycaster() {
        const rayDirection = new THREE.Vector3(0, -1, 0);
        rayDirection.normalize();
        const rayOrigin = new THREE.Vector3(0, 4, 0);
        this.raycaster = new THREE.Raycaster();
        this.raycaster.set(rayOrigin, rayDirection);
        this.raycaster.far = 6;

        const raycasterHelper = new THREE.ArrowHelper(rayDirection, rayOrigin, this.raycaster.far, '#00ff00');
        this.experienceInstance.config.scene.add(raycasterHelper);
    }
}