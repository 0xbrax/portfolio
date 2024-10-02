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



        this.theta = 0;
        this.phi = 0;
        this.thetaSpeed = 0.2;
        this.phiSpeed = 0.4;
    }

    start() {
        this.createLight();
        this.robot = new Robot();
        this.planet = new Planet();
        this.interestPoints = new InterestPoints();
        this.plane = new Plane();
        this.plane.model.cIsRotationUpdated = false;
    }

    createLight() {
        this.ambientLight = new THREE.AmbientLight('#ffffff', 1);
        this.experienceInstance.config.scene.add(this.ambientLight);

        this.directionalLight = new THREE.DirectionalLight('#ffffff', 4);
        this.directionalLight.position.set(5, 10, 5);
        this.experienceInstance.config.scene.add(this.directionalLight);
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

    updatePlaneOrbit(radius, theta, phi) {
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        this.plane.instanceGroup.position.set(x, y, z).add(this.planet.instanceGroup.position);

        this.planeLookAtCenter();
    }

    planeLookAtCenter() {
        this.plane.instanceGroup.lookAt(this.planet.instanceGroup.position);
        const normalizedPhi = this.phi % (2 * Math.PI);
        // TODO duck problem, put it on Blender ?
        /*let gap = Math.sin(normalizedPhi) * this.experienceInstance.deltaTime * this.thetaSpeed;

        if (normalizedPhi > Math.PI * 0.5) {
            gap = -gap;
        }
        if (normalizedPhi > Math.PI) {
            gap = -gap;
        }
        if (normalizedPhi > Math.PI * 1.5) {
            gap = -gap;
        }*/

        if (this.plane.model.cIsRotationUpdated && normalizedPhi < Math.PI) {
            this.plane.model.rotation.x = Math.PI * -0.5;
            this.plane.model.rotation.y = Math.PI;
            this.plane.model.rotation.z = 0;

            this.plane.subModel.position.y = -0.345;
            this.plane.subModel.rotation.x = Math.PI * -0.5;
            this.plane.subModel.rotation.y = Math.PI;
            this.plane.subModel.rotation.z = 0;

            this.plane.model.cIsRotationUpdated = false;
        }
        if (!this.plane.model.cIsRotationUpdated && normalizedPhi > Math.PI) {
            this.plane.model.rotation.x = Math.PI * 0.5;
            this.plane.model.rotation.y = -Math.PI;
            this.plane.model.rotation.z = Math.PI;

            this.plane.subModel.rotation.x = Math.PI * 0.5;
            this.plane.subModel.rotation.y = -Math.PI;
            this.plane.subModel.rotation.z = Math.PI;

            this.plane.subModel.position.y = 0.345;

            this.plane.model.cIsRotationUpdated = true;
        }

        //this.plane.model.rotation.y = this.plane.model.rotation.y + (!this.plane.model.cIsRotationUpdated ? -gap : gap);
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
        this.rotatePlanet(this.experienceInstance.deltaTime);
        this.planet.subModel.material.uniforms.uTime.value = this.experienceInstance.elapsedTime;
        this.plane.animation.mixer.update(this.experienceInstance.deltaTime);

        this.theta += this.experienceInstance.deltaTime * this.thetaSpeed;
        this.phi += this.experienceInstance.deltaTime * this.phiSpeed;
        this.updatePlaneOrbit(5, this.theta, this.phi);

        this.updateInterestPointsOrientation();



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