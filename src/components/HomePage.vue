<template>
    <div id="main-container">
        <div id="canvas">
            <div id="ui-ux-controls">
                <!---- TODO ---->
                <div>
                    CONTROLS {{ backgroundMusicLevel }}
                </div>

                <input type="range" id="backgroundMusicInput" v-model="backgroundMusicLevel" min="0" max="100" />
            </div>

            <div 
                v-if="whatProject !== null && whatProject !== 'LOADING'"
                id="projects-handler"
            >
                <div 
                    @click="projectsEventHandler()"
                    class="project-btn"
                >
                    Open
                </div>

                <div
                    @click="projectsEventHandler('back')"
                    class="back-btn"
                >
                    <i class="fa-solid fa-rotate-left"></i>
                </div>
            </div>
        </div>

        <div id="loading-screen" v-if="isEnterClicked === false && !router.options.history.state.back?.includes('projects')">
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
    </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
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

import PIKARIDEimage from '../assets/projects/pikaride/pikaride.jpg';
import STARWAYimage from '../assets/projects/starway/starway.jpg';

export default {
    name: 'HomePage',

    setup() {
        // UTILS
        const router = useRouter();
        const whatProject = ref(null);

        const projectsEventHandler = (action) => {
            if (action === 'back') {
                goBackToPlane();

                return;
            }

            switch (whatProject.value) {
                case 'pikaride':
                    router.push('/projects/pikaride');
                    break;
                case 'starway':
                    window.open('https://starway.page', '_blank');
                    goBackToPlane('force');
                    break;
            }
        }

        //////// TODO
        const getRandomNumber = (min, max) => {
            return Math.random() * (max - min) + min;
        }

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

        // VIDEO
        const video = document.createElement('video');
        video.src = CLoudsSunset;
        video.autoplay = true;
        video.loop = true;
        video.playbackRate = 1;
        video.volume = 0;
        const videoTexture = new THREE.VideoTexture(video);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;

        // AUDIO
        const backgroundMusicLevel = ref(0);

        // 3D SPHERE
        const sphereGeometry = new THREE.SphereGeometry(500, 60, 40);
        sphereGeometry.scale(-1, 1, 1);
        const sphereMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        scene.add(sphere);

        // AMBIENT LIGHT
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        scene.add(ambientLight);
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
        const onWindowResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
        window.addEventListener('resize', onWindowResize, false);



        // PLANE MODEL
        const planeClock = new THREE.Clock();
        let planeModel;
        let planeMixer;
        let selectedChild;
        let isFPVActive = false;

        loader.load(Plane, (gltf) => {
            const animations = gltf.animations;
            planeModel = gltf.scene;

            planeModel.scale.set(0.5, 0.5, 0.5);
            planeModel.position.set(0.35, -0.2, 0);

            const rotationY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
            planeModel.quaternion.multiply(rotationY);

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
                    const pitch = Math.sin(progress * Math.PI * 2) * 0.0003;
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
                    const yaw = Math.sin(progress * Math.PI * 2) * 0.0002;
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
                    const roll = Math.sin(progress * Math.PI * 2) * 0.0005;
                    const rollQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), roll);
                    planeModel.quaternion.multiply(rollQuaternion);
                },
            }).play();

            planeModel.traverse((child) => {
                if (child.isMesh && child.name === 'Cube_3_Glass_0') {
                    selectedChild = child;
                }
            });

            interactionManager.add(planeModel);
            planeModel.addEventListener('click', () => {
                if (whatProject.value !== null) {
                    goBackToPlane();

                    return;
                }

                interactionManager.remove(planeModel);
                isFPVActive = true;
                selectedChild.material.transparent = true;

                controls.target.set(0, 0, 0);
                controls.enabled = false;
                controls.enableDamping = false;

                gsap.to(camera.position, {
                    duration: 0.5,
                    x: 0.36,
                    y: -0.14,
                    z: 0,
                    ease: 'power2.inOut',
                }).play();

                gsap.to(selectedChild.material, {
                    duration: 0.5,
                    opacity: 0.3,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        interactionManager.add(sphere);
                    }
                }).play();
            });

            sphere.addEventListener('click', () => {
                if (isFPVActive === false || whatProject.value === 'LOADING') {
                    return;
                }

                gsap.to(camera.position, {
                    duration: 0.5,
                    x: 0.8,
                    y: 0.2,
                    z: 0,
                    ease: 'power2.inOut',
                }).play();

                gsap.to(controls.target, {
                    duration: 0.5,
                    x: 0,
                    y: 0,
                    z: 0,
                    ease: 'power2.inOut',
                }).play();

                planeWindowReset();
            });

            scene.add(planeModel);
        });

        const goBackToPlane = (mode) => {
            whatProject.value = null;

            if (mode === 'force') {
                camera.position.set(0.8, 0.2, 0);
                controls.target.set(0, 0, 0);

                return;
            }

            gsap.to(camera.position, {
                duration: 0.7,
                x: 0.8,
                y: 0.2,
                z: 0,
                ease: 'power2.inOut',
            }).play();

            gsap.to(controls.target, {
                duration: 0.7,
                x: 0,
                y: 0,
                z: 0,
                ease: 'power2.inOut',
            }).play();
        }

        const planeWindowReset = () => {
            gsap.to(selectedChild.material, {
                duration: 0.5,
                opacity: 1,
                ease: 'power2.inOut',
                onComplete: () => {
                    selectedChild.material.transparent = false;

                    controls.enabled = true;
                    controls.enableDamping = true;

                    isFPVActive = false;
                    interactionManager.remove(sphere);
                    interactionManager.add(planeModel);
                }
            }).play();
        }



        // DRAGON + CUBE + PROJECT CONTAINER
        // dragon
        const createDragon = async (color, cubeModel) => {
            let dragonModel;
            let dragonMixer;
            let dragonAction;

            await new Promise((resolve) => {
                loader.load(Dragon, (gltf) => {
                    resolve(gltf);

                    const animations = gltf.animations;
                    dragonModel = gltf.scene;

                    dragonModel.scale.set(0.5, 0.5, 0.5);
                    dragonModel.position.set(-0.7, 0.1, -0.8);
                    dragonModel.rotation.y = -Math.PI / 2;

                    dragonModel.traverse((child) => {
                        if (child.isMesh) {
                            child.material.color.set(color);
                            child.material.map = null;
                        }
                    });

                    if (animations && animations.length) {
                        dragonMixer = new THREE.AnimationMixer(dragonModel);
                        const clip = animations[0];
                        dragonAction = dragonMixer.clipAction(clip);
                        dragonAction.play();

                        gsap.to(cubeModel.position, {
                            duration: 1.25,
                            repeat: 1,
                            yoyo: true,
                            y: cubeModel.position.y - 0.05,
                            ease: 'power1.out',
                            yoyoEase: 'power3.out'
                        }).play();

                        dragonMixer.addEventListener('loop', (event) => {
                            cubeModel.position.set(-0.80, -0.1, -0.8);
                            gsap.to(cubeModel.position, {
                                duration: 1.25,
                                repeat: 1,
                                yoyo: true,
                                y: cubeModel.position.y - 0.05,
                                ease: 'power1.out',
                                yoyoEase: 'power3.out'
                            }).play();
                        });
                    }
                });
            });

            return { dragonModel, dragonMixer, dragonAction };
        }

        // cube
        const createCube = async (color, project) => {
            let image;
            let text;
            switch (project) {
                case 'PIKARIDE':
                    image = PIKARIDEimage;
                    text = 'Pikaride';
                    break;
                case 'STARWAY':
                    image = STARWAYimage;
                    text = 'Starway';
                    break;
            }

            const texture = await new Promise((resolve) => {
                textureLoader.load(image, texture => {
                    resolve(texture);
                });
            });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 512;
            canvas.height = 512;

            context.font = '50px Ubuntu, sans-serif';
            context.textAlign = 'center';
            const textMetrics = context.measureText(text);
            const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
            context.drawImage(texture.image, 0, 0, 512, 512);
            const TEXT_BACKGROUND_HEIGHT = textHeight + 24;
            context.fillStyle = '#' + color.toString(16).padStart(6, '0');
            context.fillRect(0, canvas.height - TEXT_BACKGROUND_HEIGHT, canvas.width, TEXT_BACKGROUND_HEIGHT);
            context.fillStyle = '#ffffff';
            context.fillText(text, canvas.width / 2, canvas.height - ((textHeight / 2) - 2));

            const canvasTexture = new THREE.CanvasTexture(canvas);
            canvasTexture.colorSpace = THREE.SRGBColorSpace;
            canvasTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
            canvasTexture.magFilter = THREE.LinearFilter;
            canvasTexture.minFilter = THREE.NearestFilter;
            const materialCube = new THREE.MeshBasicMaterial({ color: color });
            const materialImage = new THREE.MeshBasicMaterial({ map: canvasTexture });

            const cubeMaterials = [
                materialCube, // Front
                materialCube, // Back
                materialCube, // Top
                materialCube, // Bottom
                materialImage, // Right -- [4]
                materialCube  // Left
            ];

            const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.05);
            const cubeModel = new THREE.Mesh(cubeGeometry, cubeMaterials);
            cubeModel.position.set(-0.80, -0.1, -0.8);

            return { cubeModel };
        }

        // project container
        const createProjectContainer = async (group, color, project) => {
            const { cubeModel } = await createCube(color, project);
            const { dragonModel, dragonMixer, dragonAction } = await createDragon(color, cubeModel);

            group.add(dragonModel);
            group.add(cubeModel);

            interactionManager.add(cubeModel);
            cubeModel.addEventListener('click', () => {
                controls.enabled = false;

                if (whatProject.value !== project.toLowerCase()) {
                    whatProject.value = 'LOADING';
                }

                if (isFPVActive === true) {
                    planeWindowReset();
                }

                // ANIMATION
                const DISTANCE = 0.5;
                const DURATION = 0.7;
                const initialCameraPosition = camera.position.clone();
                const initialControlsRotation = controls.target.clone();
                const elementPosition = group.position.clone();

                // SYNC with cubeModel position in group
                elementPosition.x += -0.80;
                elementPosition.y += -0.1;
                elementPosition.z += -0.8;

                const newCameraPosition = elementPosition.clone().add(new THREE.Vector3(0, 0, DISTANCE));

                const zoomAnimation = gsap.timeline({
                    onUpdate: () => {
                        const progress = zoomAnimation.progress();
                        controls.target.lerpVectors(initialControlsRotation, elementPosition, progress);
                        camera.position.lerpVectors(initialCameraPosition, newCameraPosition, progress);
                    },
                    onComplete: () => {
                        controls.enabled = true;
                        whatProject.value = project.toLowerCase();
                    }
                });
                zoomAnimation.to({}, {
                    duration: DURATION,
                    ease: 'power2.inOut'
                });
                zoomAnimation.play();
            });

            return { dragonModel, dragonMixer, dragonAction };
        }






        // PROJECT MODEL 1
        const PROJECT_NAME_1 = 'PIKARIDE';
        const PROJECT_COLOR_1 = 0x00ff00;
        const projectGroup_1 = new THREE.Group();
        const dragonClock_1 = new THREE.Clock();
        let project_1;
        let dragonMixer_1;

        // PROJECT MODEL 2
        const PROJECT_NAME_2 = 'STARWAY';
        const PROJECT_COLOR_2 = 0xff00ff;
        const projectGroup_2 = new THREE.Group();
        const dragonClock_2 = new THREE.Clock();
        let project_2;
        let dragonMixer_2;






        // TRUCK GROUP
        const truckGroup = new THREE.Group();
        truckGroup.position.set(-0.1, -0.2, -0.5);
        scene.add(truckGroup);

        gsap.to(truckGroup.position, {
            repeat: -1,
            yoyo: true,
            duration: 4,
            x: truckGroup.position.x + 0.05,
            y: truckGroup.position.y - 0.05,
            z: truckGroup.position.z + 0.05,
            ease: 'linear',
        }).play();

        // ICECREAM TRUCK MODEL
        let truckModel;

        loader.load(Truck, (gltf) => {
            truckModel = gltf.scene;

            truckModel.scale.set(0.1, 0.1, 0.1);
            truckModel.position.set(-0.6, 0.5, 1.1);
            truckModel.rotation.y = -Math.PI / 2;

            truckGroup.add(truckModel);
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

            truckGroup.add(rocketModel);
        });

        // ROCKET CYLINDER MODEL
        const cylinderMaterial = new THREE.MeshBasicMaterial({ color: 0x4d4d4d });
        const cylinderGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.05, 32);
        const cylinderModel = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        cylinderModel.position.set(-0.47, 0.45, 1.1);
        cylinderModel.rotation.z = Math.PI / 2;

        truckGroup.add(cylinderModel);

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

            truckGroup.add(flameModel);
        });






        // GITHUB MODEL
        let githubModel;

        loader.load(Github, (gltf) => {
            githubModel = gltf.scene;

            githubModel.scale.set(0.05, 0.05, 0.05);
            githubModel.position.set(0.6, 0.3, 1.1);
            githubModel.rotation.y = Math.PI / 1;

            scene.add(githubModel);

            interactionManager.add(githubModel);
            githubModel.addEventListener('click', () => {
                window.open('https://github.com/0xbrax', '_blank');
            });
        });

        // LINKEDIN MODEL
        let linkedinModel;

        loader.load(Linkedin, (gltf) => {
            linkedinModel = gltf.scene;

            linkedinModel.scale.set(0.5, 0.5, 0.5);
            linkedinModel.position.set(0.8, 0.3, 1.1);
            linkedinModel.rotation.y = Math.PI / 1;

            scene.add(linkedinModel);

            interactionManager.add(linkedinModel);
            linkedinModel.addEventListener('click', () => {
                window.open('https://www.linkedin.com/in/marco-braccini', '_blank');
            });
        });

        // TWITTER MODEL
        let twitterModel;

        loader.load(Twitter, (gltf) => {
            twitterModel = gltf.scene;

            twitterModel.scale.set(0.01, 0.01, 0.01);
            twitterModel.position.set(1.1, 0.5, 1.1);
            twitterModel.rotation.y = Math.PI / 1;

            scene.add(twitterModel);

            interactionManager.add(twitterModel);
            twitterModel.addEventListener('click', () => {
                window.open('https://twitter.com/0xbrax', '_blank');
            });
        });

        // INSTAGRAM MODEL
        let instagramModel;

        loader.load(Instagram, (gltf) => {
            instagramModel = gltf.scene;

            instagramModel.scale.set(0.3, 0.3, 0.3);
            instagramModel.position.set(1.6, 0.5, 1.1);
            instagramModel.rotation.y = Math.PI / 2;

            scene.add(instagramModel);

            interactionManager.add(instagramModel);
            instagramModel.addEventListener('click', () => {
                window.open('https://www.instagram.com/0xbrax', '_blank');
            });
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

        const doEnter = () => {
            isEnterClicked.value = true;
            video.play();
        }






        // INIT
        animate();

        onMounted(async () => {
            const canvas = document.getElementById('canvas');
            canvas.appendChild(renderer.domElement);



            project_1 = await createProjectContainer(projectGroup_1, PROJECT_COLOR_1, PROJECT_NAME_1);
            dragonMixer_1 = project_1.dragonMixer;
            projectGroup_1.position.set(1.5, 0.5, -0.1);
            scene.add(projectGroup_1);

            project_2 = await createProjectContainer(projectGroup_2, PROJECT_COLOR_2, PROJECT_NAME_2);
            dragonMixer_2 = project_2.dragonMixer;
            projectGroup_2.position.set(0, 0.5, -0.1);
            scene.add(projectGroup_2);



            if (router.options.history.state.back?.includes('projects')) {
                doEnter();
            }

            const rangeInput = document.getElementById('backgroundMusicInput');
            rangeInput.addEventListener('input', () => {
                const value = (rangeInput.value - rangeInput.min) / (rangeInput.max - rangeInput.min) * 100;
                rangeInput.style.background = `linear-gradient(to right, #ff0000 0%, #ff0000 ${value}%, #ffffff ${value}%, #ffffff 100%)`;
            });
        })

        return {
            progress,
            isEnterClicked,
            router,
            doEnter,
            whatProject,
            projectsEventHandler,
            backgroundMusicLevel
        }
    }
}
</script>