import Experience from "./Experience.js";
import * as THREE from "three";
import EventEmitter from "@/experience/EventEmitter.js";
import Robot from "@/experience/Robot.js";
import Planet from "@/experience/Planet.js";
import InterestPoints from "@/experience/InterestPoints.js";
import Plane from "@/experience/Plane.js";



export default class World extends EventEmitter {
    constructor() {
        super();

        this.experienceInstance = new Experience();

        this.isFPVActive = false;

        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            Space: false
        };
        this.planetRotationSpeed = 0.6;



        // TODO invert theta symbol to set direction (with subInstanceGroup rotY) and intersection direction
        this.thetaSpeed = 0.02;
        this.phiSpeed = 0.4;
        this.thetaIntesectionSpeed = 0.3;
        this.phiIntesectionSpeed = 0.5;
    }

    start() {
        this.createLight();
        this.planet = new Planet();

        this.planet.on('workerComplete', () => {
            this.robot = new Robot();
            this.interestPoints = new InterestPoints();
            this.plane = new Plane();

            /*if (!this.isFPVActive) return;
            this.plane.subInstanceGroup.rotation.x = 0.75; // todo var
            this.thetaSpeed = 0;*/

            this.emit('loadComplete');
        }, { once: true });



        /*this.experienceInstance.config.controls.enabled = false;
        //this.experienceInstance.config.controls.enablePan = false;
        //this.experienceInstance.config.controls.enableZoom = false;

        this.experienceInstance.config.scene.remove(this.experienceInstance.config.camera);
        this.plane.instanceGroup.add(this.experienceInstance.config.camera);
        this.experienceInstance.config.camera.position.set(-1, 9, 0);

        this.experienceInstance.config.controls.target.set(1, 3, 0);

        this.experienceInstance.config.controls.update();*/
    }

    createLight() {
        this.ambientLight = new THREE.AmbientLight('#ffffff', 1);
        this.experienceInstance.config.scene.add(this.ambientLight);

        this.directionalLight = new THREE.DirectionalLight('#ffffff', 4);
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
    movePlane(deltaTime) {
        /*const angleZ = this.plane.instanceGroup.rotation.z % (Math.PI * 2);

        this.sign = 1;
        if (angleZ <= 0 && angleZ > -Math.PI) {
            console.log("Angolo tra 0 e -π");

            this.sign = -1;
        } else if (angleZ <= -Math.PI && angleZ > -2 * Math.PI) {
            console.log("Angolo tra -π e -2π");

            this.sign = 1;
        }*/

        if (this.keys.ArrowUp) {
            this.plane.instanceGroup.rotation.z -= deltaTime * (this.phiSpeed + this.phiIntesectionSpeed);
        } else if (this.keys.ArrowDown) {
            this.plane.instanceGroup.rotation.z -= (deltaTime * this.phiSpeed) / 2;
        } else if (this.keys.ArrowLeft) {
            /*if (this.sign === -1) this.plane.instanceGroup.rotation.x += deltaTime * (this.thetaSpeed + this.thetaIntesectionSpeed);
            else this.plane.instanceGroup.rotation.x -= deltaTime * (this.thetaSpeed + this.thetaIntesectionSpeed);*/

            this.plane.instanceGroup.rotation.x += deltaTime * (this.thetaSpeed + this.thetaIntesectionSpeed);
        } else if (this.keys.ArrowRight) {
            this.plane.instanceGroup.rotation.x -= deltaTime * (this.thetaSpeed + this.thetaIntesectionSpeed);
        }
    }

    updateInterestPointsOrientation() {
        const cameraPosition = this.experienceInstance.config.camera.position;

        this.interestPoints.instanceGroup.children.forEach((el) => {
            el.lookAt(new THREE.Vector3(0,  this.experienceInstance.world.planet.instanceGroup.position.y, 0));

            const direction = new THREE.Vector3().subVectors(cameraPosition, el.position).normalize();
            const angle = Math.atan2(direction.z, direction.x);

            el.rotation.z = angle + Math.PI * -0.5;
        });
    }


    
    update() {
        this.robot.animation.mixer.update(this.experienceInstance.deltaTime);
        if (!this.isFPVActive) this.rotatePlanet(this.experienceInstance.deltaTime);
        if (this.isFPVActive) this.movePlane(this.experienceInstance.deltaTime);
        this.planet.subModel.material.uniforms.uTime.value = this.experienceInstance.elapsedTime;
        this.plane.animation.mixer.update(this.experienceInstance.deltaTime);
        this.updateInterestPointsOrientation();



        const intersects = this.robot.raycaster.intersectObject(this.planet.model);
        if (intersects.length > 0) {
            const intersect = intersects[0];
            this.robot.instanceGroup.position.y = (intersect.distance - this.robot.raycaster.ray.origin.y) * -1;
        }

        this.interestPoints.instanceGroup.children.forEach((object) => {
            const updatedObjectBoundingBox = new THREE.Box3().setFromObject(object);

            if (!object.cIsIntersected && this.robot.circlecasterBoundingBox.intersectsBox(updatedObjectBoundingBox)) {
                object.cIsIntersected = true;
                object.scale.setScalar(1.5);
                this.emit('intersectInterest', object.cProps);
            }
            if (object.cIsIntersected && !this.robot.circlecasterBoundingBox.intersectsBox(updatedObjectBoundingBox)) {
                object.cIsIntersected = false;
                object.scale.setScalar(1);
                this.emit('unIntersectInterest', object.cProps)
            }
        });

        /*const updatedPlaneBoundingBox = new THREE.Box3().setFromObject(this.plane.subInstanceGroup);
        if (this.robot.circlecasterBoundingBox.intersectsBox(updatedPlaneBoundingBox)) {
            //console.log('LOG --------')

            this.plane.instanceGroup.rotation.x -= this.experienceInstance.deltaTime * (this.thetaSpeed + this.thetaIntesectionSpeed);
            this.plane.instanceGroup.rotation.z -= this.experienceInstance.deltaTime * (this.phiSpeed + this.phiIntesectionSpeed);
        } else {
            this.updatePlaneOrbit(this.experienceInstance.deltaTime);
        }*/
        this.updatePlaneOrbit(this.experienceInstance.deltaTime);
    }
}