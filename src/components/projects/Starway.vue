<template>
    <div id="starway">
        <header>
            <nav class="container">
                <div class="text-ctr text-cap">
                    <router-link to="/">Go to HOME</router-link> starway
                </div>
            </nav>
        </header>

        <main>
            <section id="hero" class="py-40">
                <div class="container">
                    <div class="row align-ctr">
                        <div class="col-P1">
                            <div class="h-100 d-flex align-ctr">
                                <div>
                                    <div class="fs-22">
                                        Starway provides your daily horoscope, just try it.
                                    </div>
                                    <div class="d-flex mt-40">
                                        <a class="download-btn rounded d-flex align-ctr" href="https://play.google.com/store/apps/details?id=dev.zeroxbrax.starway" target="_blank">
                                            <img id="logo-google-play" class="inline-block" src="@/assets/projects/starway/img/google-play.png" alt="Starway on Google PLay">
                                            <div class="ml-10">
                                                <div>GET IT ON</div>
                                                <div class="fs-22">Google Play</div>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-P2">
                            <img id="logo-starway" class="rounded" src="@/assets/projects/starway/img/starway-main-logo.png" alt="Starway">
                        </div>
                    </div>
                </div>
            </section>

            <section id="info" class="py-40">
                <div class="container">
                    <div class="row">
                        <div class="col-P2">
                            <div class="h-100 d-flex align-ctr">
                                <img src="@/assets/projects/starway/img/stickman-blank-idle-new.gif" alt="0xbrax">
                            </div>
                        </div>
                        <div class="col-P1">
                            <div class="h-100 d-flex align-ctr">
                                Introducing Starway, an horoscope app which provides daily astrological predictions, love compatibility, lucky numbers, and a quote of the day. Users can access yesterday's, today's, and tomorrow's horoscope for their zodiac sign, easy to use. There are no limits, you can change your sign everytime you want. Special quotes could make you happier and could help users to make into the best way their daily challenges providing daily motivation and encouragement to achieve their goals and stay positive.
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="sign" class="d-flex align-ctr">

                    <div id="sign-card-container" class="d-flex">
                        <!-- Filled with JJ -->
                    </div>

            </section>

            <section id="bonus" class="py-40">
                <div class="container">
                    <div class="text-ctr">
                        Starway is for you. Starway is for everyone.
                    </div>

                    <div class="text-ctr">
                        Starway is for you.<br>
                        Starway is for everyone.
                    </div>
                </div>
            </section>
        </main>
    </div>
</template>

<script>
import { onMounted } from 'vue';
import ariesImage from '@/assets/projects/starway/img/1-aries.svg';
import taurusImage from '@/assets/projects/starway/img/2-taurus.svg';
import geminiImage from '@/assets/projects/starway/img/3-gemini.svg';
import cancerImage from '@/assets/projects/starway/img/4-cancer.svg';
import leoImage from '@/assets/projects/starway/img/5-leo.svg';
import virgoImage from '@/assets/projects/starway/img/6-virgo.svg';
import libraImage from '@/assets/projects/starway/img/7-libra.svg';
import scorpioImage from '@/assets/projects/starway/img/8-scorpio.svg';
import sagittariusImage from '@/assets/projects/starway/img/9-sagittarius.svg';
import capricornImage from '@/assets/projects/starway/img/10-capricorn.svg';
import aquariusImage from '@/assets/projects/starway/img/11-aquarius.svg';
import piscesImage from '@/assets/projects/starway/img/12-pisces.svg';

export default {
    name: 'Starway',

    setup() {
        // INIT
        document.title = '0xbrax | Starway';

        onMounted(async () => {
            const zodiacSign = [
                'aries',
                'taurus',
                'gemini',
                'cancer',
                'leo',
                'virgo',
                'libra',
                'scorpio',
                'sagittarius',
                'capricorn',
                'aquarius',
                'pisces'
            ]

            const signCardContainer = document.getElementById('sign-card-container');
            let containerInitWidth = 0;
            let scrollSpeed = null;
            let scrollPos = 0;
            let mode = null;

            if (window.screen.width > 1140) {
                scrollSpeed = 0.85;
            } else if (window.screen.width > 768) {
                scrollSpeed = 0.7;
            } else if (window.screen.width > 480) {
                scrollSpeed = 0.55;
            } else {
                scrollSpeed = 0.4;
            }



            for (let i = 0; i < zodiacSign.length; i++) {
                createSignCard(i);
            }

            containerInitWidth = signCardContainer.offsetWidth;

            animateScroll();



            function createSignCard(index, mode = null) {
                let scrollClassIndex = index;

                if (mode === 'repeat') {
                    scrollClassIndex = index + 12;
                }

                const signCard = document.createElement('div');
                signCard.classList.add('sign-card', 'd-flex', 'column', 'just-ctr', 'align-ctr', 'rounded', `SCROLL-EL_${scrollClassIndex}`);

                const signImg = document.createElement('div');
                signImg.classList.add('sign-img', 'd-flex', 'align-ctr');
                const img = document.createElement('img');

                img.src = img.src = `/src/assets/projects/starway/img/${index + 1}-${zodiacSign[index]}.svg`;

                img.classList.add('sign-card-img');
                signImg.append(img);

                const signTxt = document.createElement('div');
                signTxt.innerHTML = zodiacSign[index];
                signTxt.classList.add('sign-card-txt', 'text-cap', 'rounded');

                const borderTop = document.createElement('div');
                borderTop.classList.add('sign-card-border-top', 'rounded-top');

                const borderBottom = document.createElement('div');
                borderBottom.classList.add('sign-card-border-bottom', 'rounded-bottom');

                signCard.append(signImg, signTxt, borderTop, borderBottom);

                signCardContainer.append(signCard);
            }

            function animateScroll() {
                scrollPos += scrollSpeed;
                signCardContainer.style.transform = `translateX(-${scrollPos}px)`;

                if (scrollPos >= (signCardContainer.offsetWidth - window.screen.width)) {
                    for (let i = 0; i < zodiacSign.length; i++) {
                        if (mode === 'repeat') {
                            createSignCard(i, mode);
                            mode = null;
                        } else {
                            createSignCard(i);
                        }
                    }
                }

                if (scrollPos >= containerInitWidth) {
                    for (let i = 0; i < zodiacSign.length; i++) {
                        const scrollSign = document.querySelector(`.SCROLL-EL_${i}`);
                        scrollSign.remove();
                    }

                    scrollPos = 0;
                }

                window.requestAnimationFrame(animateScroll);
            }
        });
    },
};
</script>

<style scoped>
@import url("@/assets/projects/starway/css/starway.css");
</style>