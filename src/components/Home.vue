<template>
    <div id="home" ref="homeEl" class="h-full">

        <div id="controls" class="absolute right-0 bottom-0 flex items-center gap-4">
            <kbd class="kbd">space</kbd>

            <div>
                <div class="flex w-full justify-center mb-2">
                    <kbd class="kbd">▲</kbd>
                </div>
                <div class="flex w-full justify-center gap-4">
                    <kbd class="kbd">◀</kbd>
                    <kbd class="kbd">▼</kbd>
                    <kbd class="kbd">▶</kbd>
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
            { name: 'up', start: (Math.PI * 0.5) - angleSection, end: (Math.PI * 0.5) + angleSection },
            { name: 'up-right', start: (Math.PI * 0.25) - angleSection, end: (Math.PI * 0.25) + angleSection },
            { name: 'right', start: (Math.PI * 2) - angleSection, end: (Math.PI * 2) + angleSection },
            { name: 'down-right', start: (Math.PI * 1.75) - angleSection, end: (Math.PI * 1.75) + angleSection },
            { name: 'down', start: (Math.PI * 1.5) - angleSection, end: (Math.PI * 1.5) + angleSection },
            { name: 'down-left', start: (Math.PI * 1.25) - angleSection, end: (Math.PI * 1.25) + angleSection },
            { name: 'left', start: Math.PI - angleSection, end: Math.PI + angleSection }, // 300° to 360°
            { name: 'up-left', start: (Math.PI * 0.75) - angleSection, end: (Math.PI * 0.75) + angleSection },
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
                    return direction.name;
                }
            }
        };

        const getPower = (distance, joypadSize) => {
            const maxDistance = joypadSize / 2;
            if (distance < (maxDistance / 3) * 2) {
                return 'Low';
            } else {
                return 'High';
            }
        };



        onMounted(() => {
            experience = new Experience(homeEl.value, undefined, RESOURCES, INTEREST_POINTS);

            experience.on('loaded', () => {
                // wait for logo transition ends
                const timeout = setTimeout(() => {
                    isExperienceReady.value = true;
                    clearTimeout(timeout);
                }, 300);

                experience.on('intersectInterest', ({ detail }) => {
                    swiperSlides.value.unshift(detail);
                });
                experience.on('unIntersectInterest', ({ detail }) => {
                    swiperSlides.value = swiperSlides.value.filter(el => el.id !== detail.id);
                });
            }, { once: true });

            joypadOptions.zone = document.getElementById('joypad');
            joypad = nipplejs.create(joypadOptions);

            joypad.on('move', (_, nipple) => {
                console.log(getDirection(nipple.angle.radian, angleSection, directions))
                console.log(getPower(nipple.distance, joypadOptions.size))
            });
            joypad.on('end', () => {
                console.log('CONTROLS OFF');
            });
        });

        onUnmounted(() => {
            if (experience) experience.destroy();
            if (joypad) joypad.destroy();
        });

        return {
            homeEl,
            swiperSlides
        }
    }
}
</script>

<style>
</style>
