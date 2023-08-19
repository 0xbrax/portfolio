<template>
    <div id="container" @click="play()"></div>
</template>

<script>
import { onMounted } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { InteractionManager } from 'three.interactive';

import CLoudsSunset from '../assets/video/360vr_clouds_sunset.mp4';
import Plane from '../assets/other/cartoon_plane.glb';
import Dragon from '../assets/other/dragon_flying_small.glb';

import TestIMG from '../assets/image/crash-bandicoot1.jpg';

export default {
    name: "HomePage",

    setup() {
        // SCENE
        const loader = new GLTFLoader();
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
        camera.position.set(0.5, 0, 0);
        const controls = new OrbitControls(camera, renderer.domElement);
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

        let PLANE_ROTATION_X = 0.001;
        let PLANE_ROTATION_Y = 0.001;
        let PLANE_ROTATION_Z = 0.001;
        let isPlaneRotXPositive = true;
        let isPlaneRotYPositive = true;
        let isPlaneRotZPositive = true;

        loader.load(Plane, (gltf) => {
            const animations = gltf.animations;
            planeModel = gltf.scene;

            planeModel.scale.set(0.5, 0.5, 0.5);
            planeModel.position.set(0.4, -0.2, 0);
            planeModel.rotation.y = -Math.PI / 1.9;

            planeModel.traverse((child) => {
                if (child.isMesh && child.name === 'Cube_1_Body_0') {
                    child.material.color.set(0xf4ff00);
                }
            });

            if (animations && animations.length) {
                planeMixer = new THREE.AnimationMixer(planeModel);
                const clip = animations[0];
                const action = planeMixer.clipAction(clip);
                action.play();

                scene.add(planeModel);
            }

            setInterval(() => {
                if (isPlaneRotXPositive) {
                    PLANE_ROTATION_X = Math.abs(PLANE_ROTATION_X);
                } else {
                    PLANE_ROTATION_X = -Math.abs(PLANE_ROTATION_X);
                }
                isPlaneRotXPositive = !isPlaneRotXPositive;
            }, 1800);
            setInterval(() => {
                if (isPlaneRotYPositive) {
                    PLANE_ROTATION_Y = Math.abs(PLANE_ROTATION_Y);
                } else {
                    PLANE_ROTATION_Y = -Math.abs(PLANE_ROTATION_Y);
                }
                isPlaneRotYPositive = !isPlaneRotYPositive;
            }, 2000);
            setInterval(() => {
                if (isPlaneRotZPositive) {
                    PLANE_ROTATION_Z = Math.abs(PLANE_ROTATION_Z);
                } else {
                    PLANE_ROTATION_Z = -Math.abs(PLANE_ROTATION_Z);
                }
                isPlaneRotZPositive = !isPlaneRotZPositive;
            }, 2200);

            interactionManager.add(planeModel);
            planeModel.addEventListener("click", (event) => {
                isFPVActive = true;
                interactionManager.add(sphere);

                camera.position.set(0.4, -0.15, 0);
                controls.enabled = false;
                planeModel.traverse((child) => {
                    if (child.isMesh && child.name === 'Cube_3_Glass_0') {
                        child.material.transparent = true;
                        child.material.opacity = 0.3;
                    }
                });
            });

            sphere.addEventListener("click", (event) => {
                if (isFPVActive === false) {
                    return;
                }
                camera.position.set(0.5, 0, 0);
                controls.enabled = true;
                planeModel.traverse((child) => {
                    if (child.isMesh && child.name === 'Cube_3_Glass_0') {
                        child.material.transparent = false;
                        child.material.opacity = 1;
                    }
                });

                isFPVActive = false;
                interactionManager.remove(sphere);
            });
        });

        // DRAGON MODEL
        const dragonClock = new THREE.Clock();
        let dragonModel;
        let dragonMixer;

        loader.load(Dragon, (gltf) => {
            const animations = gltf.animations;
            dragonModel = gltf.scene;

            dragonModel.scale.set(0.5, 0.5, 0.5);
            dragonModel.position.set(-0.7, 0.1, -0.8);
            dragonModel.rotation.y = Math.PI / 2;

            if (animations && animations.length) {
                dragonMixer = new THREE.AnimationMixer(dragonModel);
                const clip = animations[0];
                const action = dragonMixer.clipAction(clip);
                action.play();

                scene.add(dragonModel);
            }
        });








        const textureLoader = new THREE.TextureLoader();
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
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterials);
        cube.position.set(-0.55, -0.1, -0.8);
        sphere.add(cube);

        /*setInterval(() => {
            cube.position.set(-3, 0.5, 1);
        }, 10000);*/










        const animate = () => {
            requestAnimationFrame(animate);

            if (planeMixer) {
                const deltaTime = planeClock.getDelta();
                planeMixer.update(deltaTime);
            }
            if (dragonMixer) {
                const deltaTime = dragonClock.getDelta();
                dragonMixer.update(deltaTime);
            }

            //cube.position.x += 0.01;

            if (planeModel) {
                planeModel.rotation.x += PLANE_ROTATION_X;
                planeModel.rotation.y += PLANE_ROTATION_Y;
                planeModel.rotation.z += PLANE_ROTATION_Z;
            }

            controls.update();
            interactionManager.update();
            renderer.render(scene, camera);
        }

        const getRandomNumber = (min, max) => {
            return Math.random() * (max - min) + min;
        }
        const play = () => {
            video.play();
        }



        // INIT
        animate();

        onMounted(() => {
            const container = document.getElementById('container');
            container.appendChild(renderer.domElement);
        })

        return {
            play
        }
    }
}
</script>