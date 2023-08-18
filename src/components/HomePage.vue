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



        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();

        renderer.setSize(window.innerWidth, window.innerHeight);



        const video = document.createElement('video');
        video.src = CLoudsSunset;
        video.autoplay = true;
        video.loop = true;
        
        video.playbackRate = 1;
        video.volume = 0;
        const videoTexture = new THREE.VideoTexture(video);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;



        const sphereGeometry = new THREE.SphereGeometry(500, 60, 40);
        sphereGeometry.scale(-1, 1, 1);
        const sphereMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });

        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        scene.add(sphere);



        // Set up the camera and controls
        camera.position.set(0, 0, 0.1);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableZoom = false;
        controls.enablePan = false;








        const loader = new GLTFLoader();
        loader.load(CartoonPlane, (gltf) => {
            const model = gltf.scene;
            model.position.set(0.5, 0.5, 0.5); // Imposta la posizione
            model.scale.set(0.1, 0.1, 0.1); // Imposta la scala
            sphere.add(model);

            console.log(model)


        });





        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
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