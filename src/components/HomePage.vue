<template>
    <div id="container" @click="play()"></div>
</template>

<script>
import { onMounted } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { InteractionManager } from 'three.interactive';

import CLoudsSunset from '../assets/video/0819.mp4';
import Plane from '../assets/other/cartoon_plane.glb';


export default {
    name: "HomePage",

    setup() {
        // Scene
        const loader = new GLTFLoader();
        const clock = new THREE.Clock();
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);

        const interactionManager = new InteractionManager(
            renderer,
            camera,
            renderer.domElement
        );

        // Background video
        const video = document.createElement('video');
        video.src = CLoudsSunset;
        video.autoplay = true;
        video.loop = true;
        video.playbackRate = 1;
        video.volume = 0;
        const videoTexture = new THREE.VideoTexture(video);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;

        // 3D Sphere
        const sphereGeometry = new THREE.SphereGeometry(500, 60, 40);
        sphereGeometry.scale(-1, 1, 1);
        const sphereMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        scene.add(sphere);

        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        // Set up the camera and controls
        camera.position.set(0, 0, 0.1);
        camera.rotation.y = Math.PI / 4;

        console.log(camera.rotation)


        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableZoom = false; // ??
        controls.enablePan = false; // ??

        // Window resize
        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
        window.addEventListener('resize', onWindowResize, false);











        let planeModel;
        let planeMixer;

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
            planeModel.position.set(0.3, -0.3, 0.3);

            //cube.rotation.x = Math.PI / 4; // Ruota di 45 gradi lungo l'asse x
            planeModel.rotation.y = -Math.PI / 2;
            //cube.rotation.z = Math.PI / 4;

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
                console.log('CLICK AEREO');

                camera.position.set(0.3, -0.3, 0.3);
                controls.enabled = false;
            });

            animate();
        });





        /*const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        // Crea un cubo con il materiale rosso
        const cubeGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2); // Modifica le dimensioni se necessario
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        // Posiziona il cubo all'interno della sfera
        cube.position.set(0.5, 0.5, 0.5); // Modifica le coordinate per posizionarlo correttamente
        sphere.add(cube);*/










        const animate = () => {
            requestAnimationFrame(animate);

            if (planeMixer) {
                const deltaTime = clock.getDelta();
                planeMixer.update(deltaTime);
            }

            //planeModel.position.x += 0.001; // Move along the X-axis
            //planeModel.position.y += 0.001; // Move along the Y-axis
            //planeModel.position.z += 0.001; // Move along the Z-axis

            planeModel.rotation.x += PLANE_ROTATION_X;
            planeModel.rotation.y += PLANE_ROTATION_Y;
            planeModel.rotation.z += PLANE_ROTATION_Z;


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