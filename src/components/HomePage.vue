<template>
    <div id="container" @click="play()"></div>
</template>

<script>
import { onMounted } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import CLoudsSunset from '../assets/video/360vr_clouds_sunset.mp4';
import CartoonPlane from '../assets/other/cartoon_plane.glb';


export default {
    name: "HomePage",

    setup() {



        // Scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);

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
        //camera.rotation.x = Math.PI / 4;
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





        const clock = new THREE.Clock();
        let mixer;
        const loader = new GLTFLoader();
        loader.load(CartoonPlane, (gltf) => {
            const model = gltf.scene;
            const animations = gltf.animations;

            model.scale.set(0.5, 0.5, 0.5);
            model.position.set(0.1, -0.3, 0.2);
            

            //cube.rotation.x = Math.PI / 4; // Ruota di 45 gradi lungo l'asse x
            model.rotation.y = -Math.PI / 2;
            //cube.rotation.z = Math.PI / 4; 

            if (animations && animations.length) {
                mixer = new THREE.AnimationMixer(model);
                const clip = animations[0];
                const action = mixer.clipAction(clip);
                action.play();

                scene.add(model);
                animate();
            }
        });





        const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        // Crea un cubo con il materiale rosso
        const cubeGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2); // Modifica le dimensioni se necessario
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        // Posiziona il cubo all'interno della sfera
        cube.position.set(0.5, 0.5, 0.5); // Modifica le coordinate per posizionarlo correttamente
        sphere.add(cube);





        const animate = () => {
            requestAnimationFrame(animate);

            if (mixer) {
                const deltaTime = clock.getDelta();
                mixer.update(deltaTime);
            }

            renderer.render(scene, camera);
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