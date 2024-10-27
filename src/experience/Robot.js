import * as THREE from "three";
import Experience from "@/experience/Experience.js";

export default class Robot {
    constructor() {
        this.experienceInstance = new Experience();
        this.instanceGroup = new THREE.Group();
        this.instanceGroup.position.y = 0.94;
        this.experienceInstance.config.scene.add(this.instanceGroup);
        
        this.createRobot();
        this.createAnimation();
        this.createRaycaster();
        this.createCirclecaster();
    }

    createRobot() {
        this.model = this.experienceInstance.assets.models.robot.scene;
        this.model.scale.setScalar(2);

        this.instanceGroup.add(this.model);
    }

    createAnimation() {
        this.animation = {};
        this.animation.mixer = new THREE.AnimationMixer(this.model);
        this.animation.current = null;
        this.animation.actions = {};

        this.animation.actions.idle = this.animation.mixer.clipAction(this.experienceInstance.assets.models.robot.animations[1]);
        this.animation.actions.walk = this.animation.mixer.clipAction(this.experienceInstance.assets.models.robot.animations[4]);
        this.animation.actions.run = this.animation.mixer.clipAction(this.experienceInstance.assets.models.robot.animations[3]);
        this.animation.actions.dance = this.animation.mixer.clipAction(this.experienceInstance.assets.models.robot.animations[0]);

        this.animation.current = this.animation.actions.idle;
        this.animation.name = 'idle';

        this.animation.current.play();
        this.animation.isPlaying = false;
    }
    animationCrossFade(action) {
        const newAction = this.animation.actions[action];
        const oldAction = this.animation.current;
        this.animation.name = action;

        newAction.reset();
        newAction.play();
        newAction.crossFadeFrom(oldAction, 0.3);

        this.animation.current = newAction;
    }

    createRaycaster() {
        const rayDirection = new THREE.Vector3(0, -1, 0);
        rayDirection.normalize();
        const rayOrigin = new THREE.Vector3(0, 6, 0);
        this.raycaster = new THREE.Raycaster();
        this.raycaster.set(rayOrigin, rayDirection);
        this.raycaster.far = 8;
    }

    createCirclecaster() {
        const geometry = new THREE.CircleGeometry(1.75, 12);
        const material = new THREE.MeshBasicMaterial({ color: '#ff0000', side: THREE.DoubleSide, wireframe: true });

        this.circlecaster = new THREE.Mesh(geometry, material);
        this.circlecaster.rotation.x = Math.PI * -0.5;
        this.circlecaster.position.y = 1;

        this.circlecaster.visible = false;
        this.experienceInstance.config.scene.add(this.circlecaster);
        this.circlecasterBoundingBox = new THREE.Box3().setFromObject(this.circlecaster);
    }
}