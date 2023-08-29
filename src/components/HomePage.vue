<template>
    <div id="main-container">
        <div id="loading-screen" v-if="isEnterClicked === false">
            <img id="logo-img" src="../assets/image/LOGO Brax bianco no sfondo.png" alt="Brax">

            <div id="enter-btn" @click="progress === 100 ? doEnter() : undefined" :class="{ 'active': progress === 100 }">
                <div id="enter-btn-fx" :style="{ height: progress + '%'}" :class="{ 'active': progress === 100 }"></div>
                <div id="enter-text">
                    <div v-if="progress !== 100">
                        <div>Loading</div>
                        <div>{{ `${progress.toFixed(0)}%` }}</div>
                    </div>
                    <div v-else>Enter</div>
                </div>
            </div>
        </div>
        <div id="canvas"></div>
    </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { InteractionManager } from 'three.interactive';
import { gsap } from 'gsap';

import CLoudsSunset from '../assets/video/360vr_clouds_sunset.mp4';

import Plane from '../assets/other/cartoon_plane.glb';
import Dragon from '../assets/other/dragon_flying_small.glb';
import Truck from '../assets/other/icecream_truck.glb';
import Rocket from '../assets/other/rocket_ship.glb';
import Flame from '../assets/other/flame_animation.glb';

import Github from '../assets/other/github_logo.glb';
import Linkedin from '../assets/other/linkedin_logo.glb';
import Twitter from '../assets/other/twitter_logo.glb';
import Instagram from '../assets/other/instagram_logo.glb';

import TestIMG from '../assets/image/crash-bandicoot1.jpg';

export default {
    name: "HomePage",

    setup() {
        // LOADER
        const loadingManager = new THREE.LoadingManager();
        const progress = ref(0);
        const isEnterClicked = ref(false);

        loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
            progress.value = (itemsLoaded / itemsTotal) * 100;
        };

        // SCENE
        const loader = new GLTFLoader(loadingManager);
        const textureLoader = new THREE.TextureLoader();
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);

        const interactionManager = new InteractionManager(
            renderer,
            camera,
            renderer.domElement
        );

        // BACKGROUND VIDEO
        const video = document.createElement('video');
        video.src = CLoudsSunset;
        video.autoplay = true;
        video.loop = true;
        video.playbackRate = 1;
        video.volume = 0;
        const videoTexture = new THREE.VideoTexture(video);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;

        // 3D SPHERE
        const sphereGeometry = new THREE.SphereGeometry(500, 60, 40);
        sphereGeometry.scale(-1, 1, 1);
        const sphereMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        scene.add(sphere);

        // AMBIENT LIGHT
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        // CAMERA & CONTROLS
        camera.position.set(0.8, 0.2, 0);
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 0, 0);
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.enableDamping = true;

        controls.rotateSpeed = -1;
        controls.panSpeed = 1;

        // WINDOW RESIZE
        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
        window.addEventListener('resize', onWindowResize, false);



        // PLANE MODEL
        const planeClock = new THREE.Clock();
        let planeModel;
        let planeMixer;
        let isFPVActive = false;

        loader.load(Plane, (gltf) => {
            const animations = gltf.animations;
            planeModel = gltf.scene;

            planeModel.scale.set(0.5, 0.5, 0.5);
            planeModel.position.set(0.4, -0.2, 0);

            const rotazioneY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
            planeModel.quaternion.multiply(rotazioneY);

            planeModel.traverse((child) => {
                if (child.isMesh && child.name === 'Cube_1_Body_0') {
                    child.material.color.set(0xfdff00);
                }
            });

            if (animations && animations.length) {
                planeMixer = new THREE.AnimationMixer(planeModel);
                const clip = animations[0];
                const action = planeMixer.clipAction(clip);

                action.play();
            }

            // ASSE x
            const planeAnimationPitch = gsap.to(planeModel.quaternion, {
                duration: 4,
                repeat: -1,
                ease: 'power2.inOut',
                onUpdate: () => {
                    const progress = planeAnimationPitch.progress();
                    const pitch = Math.sin(progress * Math.PI * 2) * 0.0006;
                    const pitchQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitch);
                    planeModel.quaternion.multiply(pitchQuaternion);
                },
            }).play();
            // ASSE y
            const planeAnimationYaw = gsap.to(planeModel.quaternion, {
                duration: 4.8,
                repeat: -1,
                ease: 'power2.inOut',
                onUpdate: () => {
                    const progress = planeAnimationYaw.progress();
                    const yaw = Math.sin(progress * Math.PI * 2) * 0.0008;
                    const yawQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
                    planeModel.quaternion.multiply(yawQuaternion);
                },
            }).play();
            // ASSE z
            const planeAnimationRoll = gsap.to(planeModel.quaternion, {
                duration: 3.6,
                repeat: -1,
                ease: 'power2.inOut',
                onUpdate: () => {
                    const progress = planeAnimationRoll.progress();
                    const roll = Math.sin(progress * Math.PI * 2) * 0.001;
                    const rollQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), roll);
                    planeModel.quaternion.multiply(rollQuaternion);
                },
            }).play();

            interactionManager.add(planeModel);
            planeModel.addEventListener('click', (event) => {
                interactionManager.remove(planeModel);
                isFPVActive = true;

                controls.target.set(0, 0, 0);
                controls.enabled = false;

                let selectedChild;
                planeModel.traverse((child) => {
                    if (child.isMesh && child.name === 'Cube_3_Glass_0') {
                        selectedChild = child;
                        selectedChild.material.transparent = true;
                    }
                });

                gsap.to(camera.position, {
                    duration: 0.5,
                    x: 0.4,
                    y: -0.14,
                    z: 0,
                    ease: 'power2.inOut',
                }).play();
                if (!selectedChild) {
                    return;
                }
                gsap.to(selectedChild.material, {
                    duration: 0.5,
                    opacity: 0.3,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        interactionManager.add(sphere);
                    }
                }).play();
            });

            sphere.addEventListener('click', (event) => {
                if (isFPVActive === false) {
                    return;
                }
                camera.position.set(0.8, 0.2, 0);
                controls.target.set(0, 0, 0);
                controls.enabled = true;
                planeModel.traverse((child) => {
                    if (child.isMesh && child.name === 'Cube_3_Glass_0') {
                        child.material.transparent = false;
                        child.material.opacity = 1;
                    }
                });

                isFPVActive = false;
                interactionManager.remove(sphere);
                interactionManager.add(planeModel);
            });

            scene.add(planeModel);
        });



        // DRAGON MODEL 1
        const dragonClock_1 = new THREE.Clock();
        let dragonModel_1;
        let dragonMixer_1;

        let CUBE_POSITION_Y = 0;

        loader.load(Dragon, (gltf) => {
            const animations = gltf.animations;
            dragonModel_1 = gltf.scene;

            dragonModel_1.scale.set(0.5, 0.5, 0.5);
            dragonModel_1.position.set(-0.7, 0.1, -0.8);
            dragonModel_1.rotation.y = Math.PI / 2;

            dragonModel_1.traverse((child) => {
                if (child.isMesh) {
                    child.material.color.set(0x00ff00);
                    child.material.map = null;
                }
            });

            if (animations && animations.length) {
                dragonMixer_1 = new THREE.AnimationMixer(dragonModel_1);
                const clip = animations[0];
                const action = dragonMixer_1.clipAction(clip);
                action.play();

                dragonMixer_1.addEventListener('loop', (event) => {
                    cubeModel.position.set(-0.55, -0.1, -0.8);
                    CUBE_POSITION_Y = 0.0002;
                    setTimeout(() => {
                        CUBE_POSITION_Y = -0.0005;
                    }, 50);
                    setTimeout(() => {
                        CUBE_POSITION_Y = -0.0002;
                    }, 1050);
                    setTimeout(() => {
                        CUBE_POSITION_Y = 0.0005;
                    }, 1300);
                    setTimeout(() => {
                        CUBE_POSITION_Y = 0.0002;
                    }, 2300);
                });
            }

            interactionManager.add(dragonModel_1);
            dragonModel_1.addEventListener('click', (event) => {
                console.log('CLICKKKK')
            });

            scene.add(dragonModel_1);
        });

        // CUBE MODEL 1
        const texture = textureLoader.load(TestIMG);
        const materialCube = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const materialImage = new THREE.MeshBasicMaterial({ map: texture });

        const cubeMaterials = [
            materialCube, // Front
            materialCube, // Back
            materialCube, // Top
            materialCube, // Bottom
            materialImage, // Right
            materialCube  // Left
        ];

        const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.05);
        const cubeModel = new THREE.Mesh(cubeGeometry, cubeMaterials);
        cubeModel.position.set(-0.55, -0.1, -0.8);

        interactionManager.add(cubeModel);
        cubeModel.addEventListener('click', (event) => {
            controls.enabled = false;

            // ANIMATION
            const distance = 0.5;
            const duration = 0.7;
            const initialCameraPosition = camera.position.clone();
            const initialControlsRotation = controls.target.clone();
            const elementPosition = cubeModel.position.clone();
            const newCameraPosition = elementPosition.clone().add(new THREE.Vector3(0, 0, distance));

            const zoomAnimation = gsap.timeline({
                onUpdate: () => {
                    const progress = zoomAnimation.progress();
                    controls.target.lerpVectors(initialControlsRotation, elementPosition, progress);
                    camera.position.lerpVectors(initialCameraPosition, newCameraPosition, progress);
                },
                onComplete: () => {
                    controls.enabled = true;
                }
            });

            zoomAnimation.to({}, {
                duration: duration,
                ease: 'power2.inOut'
            });
            zoomAnimation.play();
        });

        sphere.add(cubeModel);



        // DRAGON MODEL 2
        const dragonClock_2 = new THREE.Clock();
        let dragonModel_2;
        let dragonMixer_2;

        loader.load(Dragon, (gltf) => {
            const animations = gltf.animations;
            dragonModel_2 = gltf.scene;

            dragonModel_2.scale.set(0.5, 0.5, 0.5);
            dragonModel_2.position.set(0.7, 0.1, -0.8);
            dragonModel_2.rotation.y = Math.PI / 2;

            dragonModel_2.traverse((child) => {
                if (child.isMesh) {
                    child.material.color.set(0xff00ff);
                    child.material.map = null;
                }
            });

            if (animations && animations.length) {
                dragonMixer_2 = new THREE.AnimationMixer(dragonModel_2);
                const clip = animations[0];
                const action = dragonMixer_2.clipAction(clip);
                action.play();
            }

            scene.add(dragonModel_2);
        });



        // ICECREAM TRUCK MODEL
        let truckModel;

        loader.load(Truck, (gltf) => {
            truckModel = gltf.scene;

            truckModel.scale.set(0.1, 0.1, 0.1);
            truckModel.position.set(-0.6, 0.5, 1.1);
            truckModel.rotation.y = -Math.PI / 2;

            scene.add(truckModel);
        });

        // ROCKET MODEL
        let rocketModel;

        loader.load(Rocket, (gltf) => {
            rocketModel = gltf.scene;

            rocketModel.scale.set(0.3, 0.3, 0.3);
            rocketModel.position.set(-0.53, 0.45, 1.1);
            rocketModel.rotation.x = Math.PI / 1;
            rocketModel.rotation.y = -Math.PI / 1;
            rocketModel.rotation.z = -Math.PI / 4;

            rocketModel.traverse((child) => {
                if (child.isMesh) {
                    switch (child.name) {
                        case 'Rocket_Ship_01_Material_#29_0':
                        case 'Rocket_Ship_01_Material_#30_0':
                        case 'Rocket_Ship_01_Material_#42_0':
                            child.material.visible = false;
                    }
                }
            });

            scene.add(rocketModel);
        });

        // ROCKET CYLINDER MODEL
        const cylinderMaterial = new THREE.MeshBasicMaterial({ color: 0x4d4d4d });
        const cylinderGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.05, 32);
        const cylinderModel = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        cylinderModel.position.set(-0.47, 0.45, 1.1);
        cylinderModel.rotation.z = Math.PI / 2;

        scene.add(cylinderModel);

        // ROCKET FLAME MODEL
        const flameClock = new THREE.Clock();
        let flameModel;
        let flameMixer;

        loader.load(Flame, (gltf) => {
            const animations = gltf.animations;
            flameModel = gltf.scene;

            flameModel.scale.set(0.1, 0.3, 0.1);
            flameModel.position.set(-0.53, 0.45, 1.1);
            flameModel.rotation.z = -Math.PI / 2;

            if (animations && animations.length) {
                flameMixer = new THREE.AnimationMixer(flameModel);
                const clip = animations[0];
                const action = flameMixer.clipAction(clip);
                action.play();
            }

            scene.add(flameModel);
        });



        // GITHUB MODEL
        let githubModel;

        loader.load(Github, (gltf) => {
            githubModel = gltf.scene;

            githubModel.scale.set(0.05, 0.05, 0.05);
            githubModel.position.set(0.6, 0.3, 1.1);
            githubModel.rotation.y = Math.PI / 1;

            scene.add(githubModel);
        });

        // LINKEDIN MODEL
        let linkedinModel;

        loader.load(Linkedin, (gltf) => {
            linkedinModel = gltf.scene;

            linkedinModel.scale.set(0.5, 0.5, 0.5);
            linkedinModel.position.set(0.8, 0.3, 1.1);
            linkedinModel.rotation.y = Math.PI / 1;

            scene.add(linkedinModel);
        });

        // TWITTER MODEL
        let twitterModel;

        loader.load(Twitter, (gltf) => {
            twitterModel = gltf.scene;

            twitterModel.scale.set(0.01, 0.01, 0.01);
            twitterModel.position.set(1.1, 0.5, 1.1);
            twitterModel.rotation.y = Math.PI / 1;

            scene.add(twitterModel);
        });

        // INSTAGRAM MODEL
        let instagramModel;

        loader.load(Instagram, (gltf) => {
            instagramModel = gltf.scene;

            instagramModel.scale.set(0.3, 0.3, 0.3);
            instagramModel.position.set(1.6, 0.5, 1.1);
            instagramModel.rotation.y = Math.PI / 2;

            scene.add(instagramModel);
        });










        const animate = () => {
            if (planeMixer) {
                const deltaTime = planeClock.getDelta();
                planeMixer.update(deltaTime);
            }
            if (dragonMixer_1) {
                const deltaTime = dragonClock_1.getDelta();
                dragonMixer_1.update(deltaTime);
            }
            if (cubeModel) {
                cubeModel.position.y += CUBE_POSITION_Y;
            }
            if (dragonMixer_2) {
                const deltaTime = dragonClock_2.getDelta();
                dragonMixer_2.update(deltaTime);
            }
            if (flameMixer) {
                const deltaTime = flameClock.getDelta();
                flameMixer.update(deltaTime);
            }



            controls.update();
            interactionManager.update();
            renderer.render(scene, camera);

            requestAnimationFrame(animate);
        }

        const getRandomNumber = (min, max) => {
            return Math.random() * (max - min) + min;
        }
        const doEnter = () => {
            isEnterClicked.value = true;
            video.play();
        }



        // INIT
        animate();

        onMounted(() => {
            const canvas = document.getElementById('canvas');
            canvas.appendChild(renderer.domElement);
        })

        return {
            progress,
            isEnterClicked,
            doEnter
        }
    }
}
</script>