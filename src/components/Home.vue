<template>
    <div id="home" ref="homeEl" class="h-full relative">
        <div id="fpv-transition" class="h-full w-full absolute z-[100] pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <mask id="fpv-transition__svg-mask">
                        <rect width="100%" height="100%" fill="white"/>
                        <circle ref="fpvTransitionCircleEl" cx="50%" cy="50%" r="100%" fill="black"/>
                    </mask>
                </defs>

                <rect width="100%" height="100%" fill="#fff248" mask="url(#fpv-transition__svg-mask)"/>
            </svg>
        </div>

        <div id="buttons" class="absolute right-[1rem] top-[50%] translate-y-[-50%] flex flex-col items-end gap-4">
            <button
                :class="['btn btn-outline btn-primary btn-circle', { 'btn-active': isFPVActive }]"
                :disabled="isFPVTransitionActive"
                @click="startFPVTransition()"
            >
                <LucidePlane />
            </button>

            <div class="flex flex-col items-end gap-2">
                <button
                    class="btn btn-outline btn-primary btn-circle"
                    :disabled="!settingStore.isNewPlanetReady"
                    @click="settingStore.generateNewPlanet()"
                >
                    <LucideDices />
                </button>

                <div class="badge badge-primary"><LucideEarth class="h-4 w-4 mr-2" /> {{ settingStore.worldSeed }}</div>
            </div>

            <button
                class="btn btn-outline btn-accent btn-circle"
                @click="openInfoModal()"
            >
                <LucideInfo />
            </button>
        </div>

        <div v-show="!$isMobile.value && !isFPVActive" id="keys" class="absolute z-20 left-[1rem] bottom-[1rem] flex items-center gap-4">
            <div>
                <div class="flex w-full justify-center mb-2">
                    <kbd :class="['kbd', { 'opacity-50': !inputKeys.KeyW }]">W</kbd>
                </div>
                <div class="flex w-full justify-center gap-2">
                    <kbd :class="['kbd', { 'opacity-50': !inputKeys.KeyA }]">A</kbd>
                    <kbd :class="['kbd', { 'opacity-50': !inputKeys.KeyS }]">S</kbd>
                    <kbd :class="['kbd', { 'opacity-50': !inputKeys.KeyD }]">D</kbd>
                </div>
            </div>
            <kbd :class="['kbd', { 'opacity-50': !inputKeys.Space }]">space</kbd>

            <div v-show="isInfoModalOpen" class="absolute left-[4rem] top-[-8rem] text-primary rotate-[15deg] pointer-events-none">
                <LucideMoveDown class="h-32 w-32  animate-bounce" />
            </div>
        </div>

        <div v-show="$isMobile.value && !isFPVActive" id="joypad" class="absolute z-20 left-[1rem] bottom-[8rem] h-[100px] aspect-square rounded-full">
            <div v-show="isInfoModalOpen" class="absolute z-20 left-[2rem] top-[4rem] text-primary rotate-[165deg] pointer-events-none">
                <LucideMoveDown class="h-32 w-32  animate-bounce" />
            </div>
        </div>

        <transition name="fade">
            <swiper-container
                v-show="!isFPVActive && swiperSlides.length"
                effect="cards"
                class="h-28 md:h-32 w-4/5 md:w-96 absolute z-10 left-[50%] bottom-0 translate-x-[-50%]"
            >
                <swiper-slide
                    v-for="slide in swiperSlides"
                    :key="slide.id"
                    class="card glass flex justify-center items-center p-4"
                >
                    <div class="flex flex-col items-center gap-2">
                        <a
                            :href="slide.url"
                            target="_blank"
                            class="flex items-center gap-2 md:text-xl font-bold cursor-pointer"
                        >
                            <span class="grow">{{ slide.title }}</span>
                            <LucideSquareArrowUpRight class="h-6 md:h-7 w-6 md:w-7" />
                        </a>
                        <div v-if="slide.description" class="text-center text-xs md:text-sm">
                            {{ slide.description }}
                        </div>
                    </div>
                </swiper-slide>
            </swiper-container>
        </transition>

        <dialog @close="closeInfoModal()" id="info-modal" ref="infoModalEl" class="modal">
            <div class="modal-box overflow-visible">
                <h3 class="text-lg font-bold flex items-center gap-2"><LucideInfo />Info</h3>
                <p class="py-4">
                    Walk around the planet and reach interest points.<br />
                    Try different world seed numbers.<br/>
                    Enjoy FPV plane mode.
                </p>
                <div class="modal-action mt-2 relative">
                    <form method="dialog" class="absolute top-[1.5rem] left-[50%] translate-y-[-50%] translate-x-[-50%]">
                        <button class="btn btn-lg btn-active">Got it !</button>
                    </form>
                </div>
            </div>
        </dialog>
    </div>
</template>

<script>
import { onMounted, onUnmounted, reactive, ref, watch } from "vue";
import Experience from '@/experience/Experience.js';
import { RESOURCES, INTEREST_POINTS } from "@/experience/ASSETS.js";
import nipplejs from 'nipplejs';
import { $isMobile, getPseudoRandomInt } from "@/assets/utils.js";
import { useSettingStore } from "@/store/setting.js";
import { gsap } from "gsap";



export default {
    name: "Home",
    setup() {
        let experience = null;
        const settingStore = useSettingStore();

        const homeEl = ref(null);
        const swiperSlides = ref([]);
        const isFPVActive = ref(false);
        const isFPVTransitionActive = ref(false);
        const fpvTransitionCircleEl = ref(null);
        const infoModalEl = ref(null);
        const isInfoModalOpen = ref(false);

        const inputKeys = reactive({
            KeyW: false,
            KeyS: false,
            KeyA: false,
            KeyD: false,
            Space: false
        });

        let joypad = null;
        const joypadOptions = {
            zone: null,
            position: { left: '50%', top: '50%' },
            mode: 'static',
            color: '#fff248',
            restOpacity: 0.75,
            size: 100
        };

        const angleSection = Math.PI / 8;
        const directions = [
            { keys: ['KeyW'], start: (Math.PI * 0.5) - angleSection, end: (Math.PI * 0.5) + angleSection },
            { keys: ['KeyW', 'KeyD'], start: (Math.PI * 0.25) - angleSection, end: (Math.PI * 0.25) + angleSection },
            { keys: ['KeyD'], start: (Math.PI * 2) - angleSection, end: (Math.PI * 2) + angleSection },
            { keys: ['KeyS', 'KeyD'], start: (Math.PI * 1.75) - angleSection, end: (Math.PI * 1.75) + angleSection },
            { keys: ['KeyS'], start: (Math.PI * 1.5) - angleSection, end: (Math.PI * 1.5) + angleSection },
            { keys: ['KeyS', 'KeyA'], start: (Math.PI * 1.25) - angleSection, end: (Math.PI * 1.25) + angleSection },
            { keys: ['KeyA'], start: Math.PI - angleSection, end: Math.PI + angleSection }, // 300° to 360°
            { keys: ['KeyW', 'KeyA'], start: (Math.PI * 0.75) - angleSection, end: (Math.PI * 0.75) + angleSection },
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
                if ($isMobile.value) return;

                if (event.code in inputKeys) {
                    if (experience.world.isFPVActive) return;

                    switch (event.code) {
                        case 'KeyW':
                            inputKeys.KeyS = false;
                            experience.world.inputKeys.KeyS = false;
                            break;
                        case 'KeyS':
                            inputKeys.KeyW = false;
                            experience.world.inputKeys.KeyW = false;
                            break;
                        case 'KeyA':
                            inputKeys.KeyD = false;
                            experience.world.inputKeys.KeyD = false;
                            break;
                        case 'KeyD':
                            inputKeys.KeyA = false;
                            experience.world.inputKeys.KeyA = false;
                    }

                    inputKeys[event.code] = true;
                    experience.world.inputKeys[event.code] = true;

                    const anyKeyPressed = Object.keys(inputKeys).filter(key => key !== 'Space').some(key => inputKeys[key] === true);
                    if (anyKeyPressed && !experience.world.robot.animation.isPlaying) {
                        if (inputKeys.Space) {
                            experience.world.robot.animationCrossFade('run');
                            experience.world.planetRotationSpeed = 0.8;
                        }
                        else {
                            experience.world.robot.animationCrossFade('walk');
                            experience.world.planetRotationSpeed = 0.6;
                        }

                        experience.world.robot.animation.isPlaying = true;

                        gsap.killTweensOf(experience.config.camera.position);
                        experience.config.controls.enabled = false;
                        const animation = gsap.to(experience.config.camera.position, {
                            x: 0,
                            y: 6,
                            z: -21,
                            duration: 0.9,
                            ease: "power2.inOut",
                            onComplete: () => {
                                animation.kill();
                                experience.config.controls.enabled = true;
                            }
                        });
                    }
                    if (experience.world.robot.animation.isPlaying && experience.world.robot.animation.name !== 'run' && inputKeys.Space) {
                        experience.world.robot.animationCrossFade('run');
                        experience.world.planetRotationSpeed = 0.8;
                    }
                }
            });
            window.addEventListener('keyup', (event) => {
                if ($isMobile.value) return;

                if (event.code in inputKeys) {
                    inputKeys[event.code] = false;
                    experience.world.inputKeys[event.code] = false;

                    if (experience.world.isFPVActive) return;

                    const anyKeyPressed = Object.keys(inputKeys).filter(key => key !== 'Space').some(key => inputKeys[key] === true);
                    if (!anyKeyPressed && experience.world.robot.animation.isPlaying) {
                        experience.world.robot.animationCrossFade('idle');
                        experience.world.robot.animation.isPlaying = false;
                    }

                    if (experience.world.robot.animation.isPlaying && experience.world.robot.animation.name === 'run' && !inputKeys.Space) {
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
                if (!$isMobile.value) return;

                Object.keys(inputKeys).forEach((key) => {
                    inputKeys[key] = false;
                    experience.world.inputKeys[key] = false;
                });

                if (experience.world.isFPVActive) return;

                const direction = getDirection(nipple.angle.radian, angleSection, directions);
                const power = getPower(nipple.distance, joypadOptions.size)

                if (direction.length === 1) {
                    const directionKey = direction[0];
                    inputKeys[directionKey] = true;
                    experience.world.inputKeys[directionKey] = true;
                } else if (direction.length === 2) {
                    const directionKeys = direction;
                    directionKeys.forEach((key) => {
                        inputKeys[key] = true;
                        experience.world.inputKeys[key] = true;
                    });
                }

                if (power === 'high') {
                    inputKeys.Space = true;
                    experience.world.inputKeys.Space = true;
                } else if (power === 'low') {
                    inputKeys.Space = false;
                    experience.world.inputKeys.Space = false;
                }

                const anyKeyPressed = Object.keys(inputKeys).filter(key => key !== 'Space').some(key => inputKeys[key] === true);
                if (anyKeyPressed && !experience.world.robot.animation.isPlaying) {
                    experience.world.robot.animation.isPlaying = true;

                    gsap.killTweensOf(experience.config.camera.position);
                    experience.config.controls.enabled = false;
                    const animation = gsap.to(experience.config.camera.position, {
                        x: 0,
                        y: 6,
                        z: -21,
                        duration: 0.9,
                        ease: "power2.inOut",
                        onComplete: () => {
                            animation.kill();
                            experience.config.controls.enabled = true;
                        }
                    });
                }
                if (experience.world.robot.animation.isPlaying && experience.world.robot.animation.name !== 'run' && inputKeys.Space) {
                    experience.world.robot.animationCrossFade('run');
                    experience.world.planetRotationSpeed = 0.8;
                } else if (experience.world.robot.animation.isPlaying && experience.world.robot.animation.name !== 'walk' && !inputKeys.Space) {
                    experience.world.robot.animationCrossFade('walk');
                    experience.world.planetRotationSpeed = 0.6;
                }
            });
            joypad.on('end', () => {
                if (!$isMobile.value) return;

                Object.keys(inputKeys).forEach((key) => {
                    inputKeys[key] = false;
                    experience.world.inputKeys[key] = false;
                });

                if (experience.world.isFPVActive) return;

                experience.world.robot.animationCrossFade('idle');
                experience.world.robot.animation.isPlaying = false;
            });
        };



        const setUnsetFPV = () => {
            isFPVActive.value = !isFPVActive.value;
            experience.world.setUnsetFPV();

            if (isFPVActive.value) experience.assets.sounds.planeIdleFX.play();
            else experience.assets.sounds.planeIdleFX.stop();
        };
        const startFPVTransition = () => {
            isFPVTransitionActive.value = true;

            const animation_1 = gsap.to(fpvTransitionCircleEl.value, {
                r: "0%",
                duration: 0.6,
                ease: "power2.inOut",
                paused: true,
                onComplete: () => {
                    animation_1.kill();
                    setUnsetFPV();
                    animation_2.play();
                }
            });
            const animation_2 = gsap.to(fpvTransitionCircleEl.value, {
                r: "100%",
                duration: 0.6,
                ease: "power2.inOut",
                paused: true,
                onComplete: () => {
                    animation_2.kill();
                    isFPVTransitionActive.value = false;
                }
            });

            animation_1.play();
        };

        const openInfoModal = () => {
            infoModalEl.value.showModal();
            isInfoModalOpen.value = true;
        };
        const closeInfoModal = () => {
            if (settingStore.isFirstTimeVisit) {
                settingStore.isFirstTimeVisit = false;

                const timeout = setTimeout(() => {
                    if (!infoModalEl.value.open) isInfoModalOpen.value = false;
                    clearTimeout(timeout);
                }, 2_500);
            } else {
                isInfoModalOpen.value = false;
            }
        };



        onMounted(() => {
            const randomSeed = getPseudoRandomInt(-1000, 1000);
            // store seed updated when worker inits
            experience = new Experience(homeEl.value, RESOURCES, INTEREST_POINTS, randomSeed);
            settingStore.experienceRef = experience;

            experience.on('loaded', () => {
                setKeysControl();
                setJoypadControl();

                settingStore.isExperienceReady = true;

                experience.world.on('intersectInterest', ({ detail }) => {
                    swiperSlides.value.unshift(detail);
                });
                experience.world.on('unIntersectInterest', ({ detail }) => {
                    swiperSlides.value = swiperSlides.value.filter(el => el.id !== detail.id);
                });

                experience.on('newPlanetReady', () => {
                    settingStore.isNewPlanetReady = true;
                });
            }, { once: true });



            watch(
                () => settingStore.hasExperienceEntered,
                (value) => {
                    if (value) {
                        experience.assets.sounds.background.play();

                        if (settingStore.isFirstTimeVisit) openInfoModal();
                    }
                }
            );
        });



        onUnmounted(() => {
            if (experience) experience.destroy();
            if (joypad) joypad.destroy();
        });

        return {
            homeEl,
            swiperSlides,
            inputKeys,
            isFPVActive,
            isFPVTransitionActive,
            fpvTransitionCircleEl,
            startFPVTransition,
            infoModalEl,
            isInfoModalOpen,
            openInfoModal,
            closeInfoModal,
            settingStore
        }
    }
}
</script>

<style>
#joypad .nipple {
    z-index: 10 !important;
}
#joypad .back,
#joypad .front {
    border-width: 1px;
    border-color: var(--fallback-bc, oklch(var(--bc) / var(--tw-border-opacity)));
    --tw-border-opacity: 0.2;
}
#joypad .back {
    opacity: 0.5 !important;
}
#joypad .front {
    opacity: 1 !important;
}

#home .btn.btn-active {
    outline-style: solid;
    outline-width: 2px;
    outline-offset: 2px;
}
</style>