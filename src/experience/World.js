import Experience from "./Experience.js";
import * as THREE from "three";
import EventEmitter from "@/experience/EventEmitter.js";
import Robot from "@/experience/Robot.js";
import Planet from "@/experience/Planet.js";
import InterestPoints from "@/experience/InterestPoints.js";
import Plane from "@/experience/Plane.js";
import { gsap } from "gsap";



export default class World extends EventEmitter {
    constructor() {
        super();

        this.experienceInstance = new Experience();

        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            Space: false
        };
        this.planetRotationSpeed = 0.6;

        this.thetaSpeed = 0.02;
        this.phiSpeed = 0.4;
        // TODO quando l'aereo gira al contrari onon funziona il valore va invertito
        this.thetaIntesectionSpeed = 0.4;
        this.phiIntesectionSpeed = 0.6;

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

        console.time('t POINT');
        await this.loadObject('interestPoints', InterestPoints, selectedPoints);
        console.timeEnd('t POINT');

        console.time('t PLANE');
        await this.loadObject('plane', Plane);
        console.timeEnd('t PLANE');

        this.emit('loadComplete');



        this.planet.on('newPlanetWorkerComplete', ({ detail }) => {
            const selectedPoints = detail.selectedPoints;
            this.interestPoints.instanceGroup.children.forEach((object, i) => {
                this.interestPoints.setSphericalPosition(object, selectedPoints[i]);
            });
        });
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
        this.experienceInstance.config.scene.add(this.ambientLight);

        this.directionalLight = new THREE.DirectionalLight('#ffffff', 3);
        this.directionalLight.position.set(5, 10, 5);
        this.experienceInstance.config.scene.add(this.directionalLight);
    }

    rotatePlanet(deltaTime) {
        const rotationSpeed = deltaTime * this.planetRotationSpeed;
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
            rotationAxis.set(-1, 0, 0).normalize();
            this.robot.instanceGroup.rotation.set(0, 0, 0);
        } else if (this.keys.ArrowDown) {
            rotationAxis.set(1, 0, 0).normalize();
            this.robot.instanceGroup.rotation.set(0, Math.PI, 0);
        } else if (this.keys.ArrowLeft) {
            rotationAxis.set(0, 0, 1).normalize();
            this.robot.instanceGroup.rotation.set(0, Math.PI * 0.5, 0);
        } else if (this.keys.ArrowRight) {
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
        this.plane.instanceGroup.rotation.x -= deltaTime * this.thetaSpeed;
        this.plane.instanceGroup.rotation.z -= deltaTime * this.phiSpeed;
    }

    updateInterestPointsOrientation() {
        const cameraPosition = this.experienceInstance.config.camera.position.clone();

        this.interestPoints.instanceGroup.children.forEach((object) => {
            const direction = new THREE.Vector3().subVectors(cameraPosition, object.position).normalize();
            const angleZ = Math.atan2(direction.z, direction.x);
            object.rotation.z = angleZ + (Math.PI * -0.5);
        });
    }

    setUnsetFPV() {
        if (!this.isFPVActive) {
            this.plane.subInstanceGroup.rotation.x = 0.5;
            this.robot.animationCrossFade('dance');

            this.experienceInstance.config.controls.enabled = false;

            this.experienceInstance.config.scene.remove(this.experienceInstance.config.camera);
            this.plane.instanceGroup.add(this.experienceInstance.config.camera);

            this.cameraPositionBeforeFPV = this.experienceInstance.config.camera.position.clone();
            this.experienceInstance.config.camera.position.set(-0.25, 7.5, 0);
            this.experienceInstance.config.camera.rotation.set(Math.PI * 1.5, 5.8, Math.PI * 1.5);
        } else {
            this.plane.subInstanceGroup.rotation.x = 0;
            this.robot.animationCrossFade('idle');

            this.experienceInstance.config.controls.enabled = true;

            this.plane.instanceGroup.remove(this.experienceInstance.config.camera);
            this.experienceInstance.config.scene.add(this.experienceInstance.config.camera);
            this.experienceInstance.config.camera.position.copy(this.cameraPositionBeforeFPV);
            this.experienceInstance.config.controls.target.set(0, 0, 0);
        }

        this.isFPVActive = !this.isFPVActive;
    }


    
    update() {
        this.robot.animation.mixer.update(this.experienceInstance.deltaTime);
        this.rotatePlanet(this.experienceInstance.deltaTime);
        this.planet.subModel.material.uniforms.uTime.value = this.experienceInstance.elapsedTime;
        this.updateInterestPointsOrientation();
        this.plane.animation.mixer.update(this.experienceInstance.deltaTime);



        if (this.planet.model) {
            const intersects = this.robot.raycaster.intersectObject(this.planet.model);
            if (intersects.length > 0) {
                const intersect = intersects[0];
                this.robot.instanceGroup.position.y = (intersect.distance - this.robot.raycaster.ray.origin.y) * -1;
            }
        } else {
            this.robot.instanceGroup.position.y = 0.95;
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

        const updatedPlaneBoundingBox = new THREE.Box3().setFromObject(this.plane.subInstanceGroup);
        if (this.robot.circlecasterBoundingBox.intersectsBox(updatedPlaneBoundingBox)) {
            this.plane.instanceGroup.rotation.x -= this.experienceInstance.deltaTime * (this.thetaSpeed + this.thetaIntesectionSpeed);
            this.plane.instanceGroup.rotation.z -= this.experienceInstance.deltaTime * (this.phiSpeed + this.phiIntesectionSpeed);
        } else {
            this.updatePlaneOrbit(this.experienceInstance.deltaTime);
        }
    }
}