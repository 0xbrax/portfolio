import Experience from "./Experience.js";
import * as THREE from "three";
import EventEmitter from "@/experience/EventEmitter.js";
import Robot from "@/experience/Robot.js";
import Planet from "@/experience/Planet.js";
import InterestPoints from "@/experience/InterestPoints.js";
import Plane from "@/experience/Plane.js";
import Clouds from "@/experience/Clouds.js";
import { gsap } from "gsap";



export default class World extends EventEmitter {
    constructor() {
        super();

        this.experienceInstance = new Experience();

        this.inputKeys = {
            KeyW: false,
            KeyS: false,
            KeyA: false,
            KeyD: false,
            Space: false
        };
        this.planetRotationSpeed = 0.6;

        // TODO Upgrade: plane controls
        this.planeThetaSpeed = 0.03;
        this.planePhiSpeed = 0.4;
        this.cloudsThetaSpeed = 0.01;
        this.cloudsPhiSpeed = 0.008;

        this.isFPVActive = false;
        this.cameraPositionBeforeFPV = null;

        this.start(); // async is ignored
    }

    async start() {
        this.createLight();

        console.time('t PLANET Worker');
        const { selectedPoints } = await this.loadObjectWithWorker('planet', Planet, this.experienceInstance.interestPoints.length);
        console.timeEnd('t PLANET Worker');

        console.time('t ROBOT');
        await this.loadObject('robot', Robot);
        console.timeEnd('t ROBOT');

        console.time('t POINTS');
        await this.loadObject('interestPoints', InterestPoints, selectedPoints);
        console.timeEnd('t POINTS');

        console.time('t PLANE');
        await this.loadObject('plane', Plane);
        console.timeEnd('t PLANE');

        console.time('t CLOUDS');
        await this.loadObject('clouds', Clouds);
        console.timeEnd('t CLOUDS');

        this.emit('loadComplete');
    }

    loadObjectWithWorker(objectName, ObjectClass, ...args) {
        return new Promise((resolve) => {
            this[objectName] = new ObjectClass(...args);
            this[objectName].on('workerComplete', ({ detail }) => {
                this.experienceInstance.config.renderer.render(this.experienceInstance.config.scene, this.experienceInstance.config.camera);
                resolve(detail);
            }, { once: true });
        });
    }
    loadObject(objectName, ObjectClass, ...args) {
        return new Promise((resolve) => {
            this[objectName] = new ObjectClass(...args);
            this.experienceInstance.config.renderer.render(this.experienceInstance.config.scene, this.experienceInstance.config.camera);
            resolve();
        });
    }

    createLight() {
        this.ambientLight = new THREE.AmbientLight('#ffffff', 1);

        this.directionalLight_1 = new THREE.DirectionalLight('#ffffff', 1.25);
        this.directionalLight_1.position.set(8, 4, 8);
        this.directionalLight_1.target.position.set(0, 0, 0);

        this.directionalLight_2 = new THREE.DirectionalLight('#ffffff', 0.75);
        this.directionalLight_2.position.set(-7, -5, -9);
        this.directionalLight_2.target.position.set(0, -2, 0);

        this.experienceInstance.config.scene.add(this.ambientLight, this.directionalLight_1, this.directionalLight_2);
    }

    rotatePlanet(deltaTime) {
        const rotationSpeed = deltaTime * this.planetRotationSpeed;
        let rotationAxis = new THREE.Vector3(0, 0, 0);
        
        if (this.inputKeys.KeyW && this.inputKeys.KeyA) {
            rotationAxis.set(-1, 0, 1).normalize();
            this.robot.instanceGroup.rotation.set(0, Math.PI * 0.25, 0);
        } else if (this.inputKeys.KeyW && this.inputKeys.KeyD) {
            rotationAxis.set(-1, 0, -1).normalize();
            this.robot.instanceGroup.rotation.set(0, Math.PI * -0.25, 0);
        } else if (this.inputKeys.KeyS && this.inputKeys.KeyA) {
            rotationAxis.set(1, 0, 1).normalize();
            this.robot.instanceGroup.rotation.set(0, Math.PI * 0.75, 0);
        } else if (this.inputKeys.KeyS && this.inputKeys.KeyD) {
            rotationAxis.set(1, 0, -1).normalize();
            this.robot.instanceGroup.rotation.set(0, Math.PI * -0.75, 0);
        }

        else if (this.inputKeys.KeyW) {
            rotationAxis.set(-1, 0, 0).normalize();
            this.robot.instanceGroup.rotation.set(0, 0, 0);
        } else if (this.inputKeys.KeyS) {
            rotationAxis.set(1, 0, 0).normalize();
            this.robot.instanceGroup.rotation.set(0, Math.PI, 0);
        } else if (this.inputKeys.KeyA) {
            rotationAxis.set(0, 0, 1).normalize();
            this.robot.instanceGroup.rotation.set(0, Math.PI * 0.5, 0);
        } else if (this.inputKeys.KeyD) {
            rotationAxis.set(0, 0, -1).normalize();
            this.robot.instanceGroup.rotation.set(0, Math.PI * -0.5, 0);
        }

        if (!rotationAxis.equals(new THREE.Vector3(0, 0, 0))) {
            const quaternion = new THREE.Quaternion();
            quaternion.setFromAxisAngle(rotationAxis, rotationSpeed);

            this.planet.instanceGroup.quaternion.multiplyQuaternions(quaternion, this.planet.instanceGroup.quaternion);
        }
    }

    updatePlaneOrbit(deltaTime) {
        this.plane.instanceGroup.rotation.x -= deltaTime * this.planeThetaSpeed;
        this.plane.instanceGroup.rotation.z -= deltaTime * this.planePhiSpeed;
    }

    updateCloudsOrbit(deltaTime) {
        this.clouds.instanceGroup.rotation.x += deltaTime * this.cloudsThetaSpeed;
        this.clouds.instanceGroup.rotation.z += deltaTime * this.cloudsPhiSpeed;
    }

    setUnsetFPV() {
        if (!this.isFPVActive) {
            this.plane.subInstanceGroup.rotation.x = 0.55;
            this.robot.animationCrossFade('dance');

            this.experienceInstance.config.controls.enabled = false;

            this.experienceInstance.config.scene.remove(this.experienceInstance.config.camera);
            this.plane.instanceGroup.add(this.experienceInstance.config.camera);

            this.cameraPositionBeforeFPV = this.experienceInstance.config.camera.position.clone();
            this.experienceInstance.config.camera.position.set(0, 9.75, 0);
            this.experienceInstance.config.camera.rotation.set(Math.PI * 1.5, 5.95, Math.PI * 1.5);
        } else {
            this.plane.subInstanceGroup.rotation.x = 0;
            this.robot.animationCrossFade('idle');

            this.experienceInstance.config.controls.enabled = true;

            this.plane.instanceGroup.remove(this.experienceInstance.config.camera);
            this.experienceInstance.config.scene.add(this.experienceInstance.config.camera);
            this.experienceInstance.config.camera.position.copy(this.cameraPositionBeforeFPV);
            this.experienceInstance.config.controls.target.set(0, 0.5, 0);
        }

        this.isFPVActive = !this.isFPVActive;
    }

    // TODO Upgrade: orientation to camera
    /*updateInterestPointsOrientation() {
        const cameraPosition = this.experienceInstance.config.camera.position.clone();

        this.interestPoints.instanceGroup.children.forEach((child) => {
            const cameraDirection = new THREE.Vector3().subVectors(cameraPosition, child.position).normalize();
            const angleZ = Math.atan2(cameraDirection.x, cameraDirection.y);
            child.rotation.z = angleZ + Math.PI;
        });
    }*/


    
    update() {
        this.robot.animation.mixer.update(this.experienceInstance.deltaTime);
        this.rotatePlanet(this.experienceInstance.deltaTime);
        this.planet.subModel.material.uniforms.uTime.value = this.experienceInstance.elapsedTime;
        this.plane.animation.mixer.update(this.experienceInstance.deltaTime);
        this.updatePlaneOrbit(this.experienceInstance.deltaTime);
        this.updateCloudsOrbit(this.experienceInstance.deltaTime);
        //this.updateInterestPointsOrientation();



        if (this.experienceInstance.isReady && this.planet.model) {
            const intersects = this.robot.raycaster.intersectObject(this.planet.model);
            if (intersects.length > 0) {
                const intersect = intersects[0];
                this.robot.instanceGroup.position.y = (intersect.distance - this.robot.raycaster.ray.origin.y + 0.06) * -1;
            }
        } else {
            this.robot.instanceGroup.position.y = 0.94;
        }

        this.interestPoints.instanceGroup.children.forEach((object) => {
            const updatedObjectBoundingBox = new THREE.Box3().setFromObject(object);

            if (!object.cIsIntersected && this.robot.circlecasterBoundingBox.intersectsBox(updatedObjectBoundingBox)) {
                object.cIsIntersected = true;

                gsap.killTweensOf(object.scale);
                const animation = gsap.to(object.scale, {
                    x: 1.5,
                    y: 1.5,
                    z: 1.5,
                    duration: 0.3,
                    ease: "power2.inOut",
                    onComplete: () => {
                        animation.kill();
                    }
                });

                this.emit('intersectInterest', object.cProps);
            }
            if (object.cIsIntersected && !this.robot.circlecasterBoundingBox.intersectsBox(updatedObjectBoundingBox)) {
                object.cIsIntersected = false;

                gsap.killTweensOf(object.scale);
                const animation = gsap.to(object.scale, {
                    x: 1,
                    y: 1,
                    z: 1,
                    duration: 0.3,
                    ease: "power2.inOut",
                    onComplete: () => {
                        animation.kill();
                    }
                });

                this.emit('unIntersectInterest', object.cProps);
            }
        });
    }
}