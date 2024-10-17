<template>
    <div id="home" ref="homeEl" class="h-full">
        <div id="buttons" class="absolute left-[50%] top-[6rem] translate-x-[-50%]">
            <LucidePlane @click="setUnsetFPV()" />

            <LucideEarth @click="generateNewPlanet()" />
        </div>

        <div id="keys" class="absolute right-0 bottom-0 flex items-center gap-4">
            <kbd :class="['kbd', { 'opacity-50': !keys.Space }]">space</kbd>

            <div>
                <div class="flex w-full justify-center mb-2">
                    <kbd :class="['kbd', { 'opacity-50': !keys.ArrowUp }]">▲</kbd>
                </div>
                <div class="flex w-full justify-center gap-4">
                    <kbd :class="['kbd', { 'opacity-50': !keys.ArrowLeft }]">◀</kbd>
                    <kbd :class="['kbd', { 'opacity-50': !keys.ArrowDown }]">▼</kbd>
                    <kbd :class="['kbd', { 'opacity-50': !keys.ArrowRight }]">▶</kbd>
                </div>
            </div>
        </div>

        <div id="joypad" class="absolute left-0 bottom-0 h-[100px] aspect-square rounded-full"></div>

        <transition name="fade">
            <swiper-container
                v-show="swiperSlides.length"
                effect="cards"
                id="swiper"
                class="mySwiper h-32 w-4/5 md:w-96 absolute left-[50%] bottom-0 translate-x-[-50%]"
            >
                <swiper-slide
                    v-for="slide in swiperSlides"
                    :key="slide.id"
                    class="card glass flex justify-center items-center"
                >
                    {{ slide.title }}
                </swiper-slide>
            </swiper-container>
        </transition>
    </div>
</template>

<script>
import { onMounted, onUnmounted, reactive, ref } from "vue";
import Experience from '@/experience/Experience.js';
import { RESOURCES, INTEREST_POINTS } from "@/experience/ASSETS.js";
import nipplejs from 'nipplejs';
import { getPseudoRandomNumber } from "@/assets/utils.js";



export default {
    name: "Home",
    setup() {
        let experience = null;
        const isExperienceReady = ref(false);

        const homeEl = ref(null);
        const swiperSlides = ref([]);

        const keys = reactive({
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            Space: false
        });

        let joypad = null;
        const joypadOptions = {
            zone: null,
            position: { left: '50%', top: '50%' },
            mode: 'static',
            color: '#fff248',
            size: 100
        };

        const angleSection = Math.PI / 8;
        const directions = [
            { keys: ['ArrowUp'], start: (Math.PI * 0.5) - angleSection, end: (Math.PI * 0.5) + angleSection },
            { keys: ['ArrowUp', 'ArrowRight'], start: (Math.PI * 0.25) - angleSection, end: (Math.PI * 0.25) + angleSection },
            { keys: ['ArrowRight'], start: (Math.PI * 2) - angleSection, end: (Math.PI * 2) + angleSection },
            { keys: ['ArrowDown', 'ArrowRight'], start: (Math.PI * 1.75) - angleSection, end: (Math.PI * 1.75) + angleSection },
            { keys: ['ArrowDown'], start: (Math.PI * 1.5) - angleSection, end: (Math.PI * 1.5) + angleSection },
            { keys: ['ArrowDown', 'ArrowLeft'], start: (Math.PI * 1.25) - angleSection, end: (Math.PI * 1.25) + angleSection },
            { keys: ['ArrowLeft'], start: Math.PI - angleSection, end: Math.PI + angleSection }, // 300° to 360°
            { keys: ['ArrowUp', 'ArrowLeft'], start: (Math.PI * 0.75) - angleSection, end: (Math.PI * 0.75) + angleSection },
        ];



        const normalizeZeroAngle = (angle, angleSection) => {
            if (angle >= 0 && angle < angleSection) {
                return angle += Math.PI * 2;
            } else {
                return angle;
            }
        };

        const getDirection = (angle, angleSection, directions) => {
            const angleNormalized = normalizeZeroAngle(angle, angleSection);

            for (const direction of directions) {
                if (angleNormalized >= direction.start && angleNormalized < direction.end) {
                    return direction.keys;
                }
            }
        };

        const getPower = (distance, joypadSize) => {
            const maxDistance = joypadSize / 2;
            if (distance < (maxDistance / 3) * 2) {
                return 'low';
            } else {
                return 'high';
            }
        };



        const setKeysControl = () => {
            window.addEventListener('keydown', (event) => {
                if (event.code in keys) {
                    keys[event.code] = true;
                    experience.world.keys[event.code] = true;

                    if (experience.world.isFPVActive) return;

                    const anyKeyPressed = Object.keys(keys).filter(key => key !== 'Space').some(key => keys[key] === true);
                    if (anyKeyPressed && !experience.world.robot.animation.isPlaying) {
                        if (keys.Space) {
                            experience.world.robot.animationCrossFade('run');
                            experience.world.planetRotationSpeed = 0.8;
                        }
                        else {
                            experience.world.robot.animationCrossFade('walk');
                            experience.world.planetRotationSpeed = 0.6;
                        }

                        experience.world.robot.animation.isPlaying = true;
                    }
                    if (experience.world.robot.animation.isPlaying && experience.world.robot.animation.name !== 'run' && keys.Space) {
                        experience.world.robot.animationCrossFade('run');
                        experience.world.planetRotationSpeed = 0.8;
                    }
                }
            });
            window.addEventListener('keyup', (event) => {
                if (event.code in keys) {
                    keys[event.code] = false;
                    experience.world.keys[event.code] = false;

                    if (experience.world.isFPVActive) return;

                    const anyKeyPressed = Object.keys(keys).filter(key => key !== 'Space').some(key => keys[key] === true);
                    if (!anyKeyPressed && experience.world.robot.animation.isPlaying) {
                        experience.world.robot.animationCrossFade('idle');
                        experience.world.robot.animation.isPlaying = false;
                    }

                    if (experience.world.robot.animation.isPlaying && experience.world.robot.animation.name === 'run' && !keys.Space) {
                        experience.world.robot.animationCrossFade('walk');
                        experience.world.planetRotationSpeed = 0.6;
                    }
                }
            });
        };

        const setJoypadControl = () => {
            joypadOptions.zone = document.getElementById('joypad');
            joypad = nipplejs.create(joypadOptions);

            joypad.on('move', (_, nipple) => {
                Object.keys(keys).forEach((key) => {
                    keys[key] = false;
                    experience.world.keys[key] = false;
                });

                if (experience.world.isFPVActive) return;

                const direction = getDirection(nipple.angle.radian, angleSection, directions);
                const power = getPower(nipple.distance, joypadOptions.size)

                if (direction.length === 1) {
                    const key = direction[0];
                    keys[key] = true;
                    experience.world.keys[key] = true;
                } else if (direction.length === 2) {
                    const keys = direction;
                    keys.forEach((key) => {
                        keys[key] = true;
                        experience.world.keys[key] = true;
                    });
                }

                if (power === 'high') {
                    keys.Space = true;
                    experience.world.keys.Space = true;
                } else if (power === 'low') {
                    keys.Space = false;
                    experience.world.keys.Space = false;
                }

                const anyKeyPressed = Object.keys(keys).filter(key => key !== 'Space').some(key => keys[key] === true);
                if (anyKeyPressed && !experience.world.robot.animation.isPlaying) {
                    experience.world.robot.animation.isPlaying = true;
                }
                if (experience.world.robot.animation.isPlaying && experience.world.robot.animation.name !== 'run' && keys.Space) {
                    experience.world.robot.animationCrossFade('run');
                    experience.world.planetRotationSpeed = 0.8;
                } else if (experience.world.robot.animation.isPlaying && experience.world.robot.animation.name !== 'walk' && !keys.Space) {
                    experience.world.robot.animationCrossFade('walk');
                    experience.world.planetRotationSpeed = 0.6;
                }
            });
            joypad.on('end', () => {
                Object.keys(keys).forEach((key) => {
                    keys[key] = false;
                    experience.world.keys[key] = false;
                });

                if (experience.world.isFPVActive) return;

                experience.world.robot.animationCrossFade('idle');
                experience.world.robot.animation.isPlaying = false;
            });
        };



        const setUnsetFPV = () => {
            experience.world.setUnsetFPV();
        };

        const generateNewPlanet = () => {
            const randomSeed = getPseudoRandomNumber(-1000, 1000);
            experience.world.planet.generateNewPlanet(randomSeed);
        };



        onMounted(() => {
            const randomSeed = getPseudoRandomNumber(-1000, 1000);
            experience = new Experience(homeEl.value, undefined, RESOURCES, INTEREST_POINTS, randomSeed);

            experience.on('loaded', () => {
                // wait for logo transition ends
                const timeout = setTimeout(() => {
                    setKeysControl();
                    setJoypadControl();


                    console.log('LFG')


                    isExperienceReady.value = true;
                    clearTimeout(timeout);
                }, 300);

                experience.world.on('intersectInterest', ({ detail }) => {
                    swiperSlides.value.unshift(detail);
                });
                experience.world.on('unIntersectInterest', ({ detail }) => {
                    swiperSlides.value = swiperSlides.value.filter(el => el.id !== detail.id);
                });
            }, { once: true });
        });

        onUnmounted(() => {
            if (experience) experience.destroy();
            if (joypad) joypad.destroy();
        });



        return {
            homeEl,
            swiperSlides,
            keys,
            setUnsetFPV,
            generateNewPlanet
        }
    }
}
</script>

<style>
</style>
