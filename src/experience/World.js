import Experience from "./Experience.js";
import * as THREE from "three";
import EventEmitter from "@/experience/EventEmitter.js";
import Robot from "@/experience/Robot.js";
import Planet from "@/experience/Planet.js";
import InterestPoints from "@/experience/InterestPoints.js";



export default class World extends EventEmitter {
    constructor() {
        super();
        this.experienceInstance = new Experience();



        // TODO emit
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false
        };
        window.addEventListener('keydown', (event) => {
            if (event.key in this.keys) {
                this.keys[event.key] = true;

                const anyKeyPressed = Object.values(this.keys).some(value => value === true);
                if (anyKeyPressed && !this.robot.animation.isPlaying) {
                    this.robot.animation.action.play();
                    this.robot.animation.isPlaying = true;
                }
            }
        });
        window.addEventListener('keyup', (event) => {
            if (event.key in this.keys) {
                this.keys[event.key] = false;

                const anyKeyPressed = Object.values(this.keys).some(value => value === true);
                if (!anyKeyPressed && this.robot.animation.isPlaying) {
                    this.robot.animation.action.stop();
                    this.robot.animation.isPlaying = false;
                }
            }
        });
    }

    start() {
        this.createLight();
        this.robot = new Robot();
        this.planet = new Planet();
        this.interestPoints = new InterestPoints();
    }

    createLight() {
        const ambientLight = new THREE.AmbientLight('#ffffff', 1);
        this.experienceInstance.config.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight('#ffffff', 1);
        directionalLight.position.set(5, 10, 5);
        this.experienceInstance.config.scene.add(directionalLight);
        const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight);
        this.experienceInstance.config.scene.add(directionalLightHelper);
    }

    rotatePlanet(deltaTime) {
        const rotationSpeed = deltaTime * 0.75;
        let rotationAxis = new THREE.Vector3(0, 0, 0);
        
        if (this.keys.ArrowUp && this.keys.ArrowLeft) {
            rotationAxis.set(-1, 0, 1).normalize();
            this.robot.instanceGroup.rotation.set(0, Math.PI * 0.25, 0);
        } else if (this.keys.ArrowUp && this.keys.ArrowRight) {
            rotationAxis.set(-1, 0, -1).normalize();
            this.robot.instanceGroup.rotation.set(0, Math.PI * -0.25, 0);
        } else if (this.keys.ArrowDown && this.keys.ArrowLeft) {
            rotationAxis.set(1, 0, 1).normalize();
            this.robot.instanceGroup.rotation.set(0, Math.PI * 0.75, 0);
        } else if (this.keys.ArrowDown && this.keys.ArrowRight) {
            rotationAxis.set(1, 0, -1).normalize();
            this.robot.instanceGroup.rotation.set(0, Math.PI * -0.75, 0);
        }

        else if (this.keys.ArrowUp) {
            rotationAxis.set(-1, 0, 0);
            this.robot.instanceGroup.rotation.set(0, 0, 0);
        } else if (this.keys.ArrowDown) {
            rotationAxis.set(1, 0, 0);
            this.robot.instanceGroup.rotation.set(0, Math.PI, 0);
        } else if (this.keys.ArrowLeft) {
            rotationAxis.set(0, 0, 1);
            this.robot.instanceGroup.rotation.set(0, Math.PI * 0.5, 0);
        } else if (this.keys.ArrowRight) {
            rotationAxis.set(0, 0, -1);
            this.robot.instanceGroup.rotation.set(0, Math.PI * -0.5, 0);
        }

        if (!rotationAxis.equals(new THREE.Vector3(0, 0, 0))) {
            const quaternion = new THREE.Quaternion();
            quaternion.setFromAxisAngle(rotationAxis, rotationSpeed);

            this.planet.instanceGroup.quaternion.multiplyQuaternions(quaternion, this.planet.instanceGroup.quaternion);
        }
    }


    
    update() {
        this.robot.animation.mixer.update(this.experienceInstance.deltaTime);
        this.rotatePlanet(this.experienceInstance.deltaTime);

        

        const intersects = this.robot.raycaster.intersectObject(this.planet.model);
        if (intersects.length > 0) {
            const intersect = intersects[0];
            this.robot.instanceGroup.position.y = (intersect.distance - this.robot.raycaster.ray.origin.y) * -1;
        }

        this.interestPoints.instanceGroup.children.forEach((object) => {
            const boundingBox = new THREE.Box3().setFromObject(object);

            if (!object.cIsIntersected && this.robot.circlecasterBoundingBox.intersectsBox(boundingBox)) {
                object.cIsIntersected = true;
                object.scale.setScalar(1.5);
            }
            if (object.cIsIntersected && !this.robot.circlecasterBoundingBox.intersectsBox(boundingBox)) {
                object.cIsIntersected = false;
                object.scale.setScalar(1);
            }
        });
    }
}