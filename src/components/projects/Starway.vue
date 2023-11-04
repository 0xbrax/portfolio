<template>
    <div id="starway">
        <header>
            <nav class="container">
                <div class="d-flex just-bt align-ctr">
                    <router-link to="/"><i class="fas fa-house mr-10"></i><span>Go to HOME</span></router-link>
                    <div class="text-cap">starway</div>
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
import { assetsUrl } from '@/assets/js/utils.js';

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
                const signCardStyle = {
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignContent: 'center',
                    borderRadius: '20px',

                    width: '150px',
                    aspectRatio: '1 / 1',
                    backgroundColor: 'var(--main-purple-light)',
                    marginLeft: '5px',
                    marginRight: '5px',
                    padding: '10px',
                    position: 'relative',
                    overflow: 'hidden'
                };
                Object.assign(signCard.style, signCardStyle);

                const signImg = document.createElement('div');
                signImg.classList.add('sign-img', 'd-flex', 'align-ctr');
                const signImgStyle = {
                    display: 'flex',
                    alignContent: 'center',

                    height: '50%',
                    position: 'relative',
                    zIndex: '12',
                };
                Object.assign(signImg.style, signImgStyle);

                const img = document.createElement('img');
                img.src = assetsUrl(`projects/starway/img/${index + 1}-${zodiacSign[index]}.svg`);
                img.classList.add('sign-card-img');
                const signImgImgStyle = {
                    maxHeight: '50px',
                    maxWidth: '50px',
                };
                Object.assign(img.style, signImgImgStyle);
                signImg.append(img);

                const signTxt = document.createElement('div');
                signTxt.innerHTML = zodiacSign[index];
                signTxt.classList.add('sign-card-txt', 'text-cap', 'rounded');
                const signTxtStyle = {
                    textTransform: 'capitalize',
                    borderRadius: '20px',

                    backgroundColor: 'var(--main-purple-light)',
                    padding: '0 5px',
                    marginTop: '7px',
                    position: 'relative',
                    zIndex: '11',
                };
                Object.assign(signTxt.style, signTxtStyle);

                const borderTop = document.createElement('div');
                borderTop.classList.add('sign-card-border-top', 'rounded-top');
                const borderTopStyle = {
                    borderTopLeftRadius: '20px',
                    borderTopRightRadius: '20px',

                    height: '67%',
                    width: '90%',
                    position: 'absolute',
                    top: '38%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: '10',
                    borderBottom: '2px solid white',
                    borderLeft: '2px solid white',
                    borderRight: '2px solid white'
                };
                Object.assign(borderTop.style, borderTopStyle);

                const borderBottom = document.createElement('div');
                borderBottom.classList.add('sign-card-border-bottom', 'rounded-bottom');

                const borderBottomStyle = {
                    borderBottomLeftRadius: '20px',
                    borderBottomRightRadius: '20px',

                    height: '20%',
                    width: '90%',
                    position: 'absolute',
                    bottom: '-6%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: '10',
                    borderTop: '2px solid white',
                    borderLeft: '2px solid white',
                    borderRight: '2px solid white'
                };
                Object.assign(borderBottom.style, borderBottomStyle);

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