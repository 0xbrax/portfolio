<template>
    <div id="spin-watch" :class="['d-flex justify-ctr align-ctr relative', { 'dimension no-watch': !isWatch }]">
        <div id="spin-watch-container" :class="['d-flex justify-ctr align-ctr', { 'dimension': isWatch, 'no-watch': !isWatch }]">
            <div @click="spin()" ref="refGame" id="game" :class="['d-flex justify-ctr align-ctr relative', { 'no-watch': !isWatch }]">
                <i v-if="isFirstPlay" class="far fa-circle-play"></i>
                
                <div 
                    class="symbol-container"
                    v-for="(el, i) in new Array(REEL_LENGTH)"
                    :key="i"
                    :ref="(container) => refSymbolContainers.push(container)"
                >
                    <div class="symbol" :ref="(symbol) => refSymbols.push(symbol)">
                        <img :src="assetsUrl(`projects/spinwatch/image/${SYMBOLS[i]}.png`)" class="w-100" />
                    </div>
                </div>

                <svg>
                    <circle 
                        ref="refProgressLeft"
                        :cx="progressDimension" 
                        :cy="progressDimension" 
                        :r="progressDimension && progressDimension - 10" 
                    />
                    <circle 
                        ref="refProgressRight"
                        :cx="progressDimension" 
                        :cy="progressDimension" 
                        :r="progressDimension && progressDimension - 10" 
                    />
                </svg>
            </div>
        </div>
    </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import { assetsUrl, getRandomNumber } from '@/assets/js/utils.js';

export default {
    name: 'SpinWatch',
    setup() {
        const isWatch = ref(window.screen.width <= 550 && window.screen.height <= 550);

        const refGame = ref(null);
        const refSymbolContainers = ref([]);
        const refSymbols = ref([]);
        const refProgressLeft = ref(null);
        const refProgressRight = ref(null);
        const progressDimension = ref();

        const REEL_LENGTH = 12;
        const DEG_GAP = 30;

        const SYMBOLS = ['o', 'bar-1', 'x-w', 'bar-3', 'x-b', 'bar-2', 'o', 'bar-3', 'x-w', 'bar-1', 'x-b', 'bar-2'];
        let randomIndex;
        let randomSymbol;

        const isFirstPlay = ref(true);
        let isLoaded = false;
        let isPlaying = false;

        let progressCounter = 0;
        const PROGRESS_INCREMENT = 60;

        const spin = () => {
            // TODO Reset degree if position is === start position => JS MAX NUMBER (degree > max when play hard)...
            // TODO a volte bug sulla rotazione del singolo simbolo su se stesso, ha un -30deg in piu


            if (!isLoaded || isPlaying) return;

            if (randomIndex != null) refSymbols.value[randomIndex].classList.remove('spin-end');
            isPlaying = true;
            let animDuration = getRandomNumber(15, 20);
            animDuration = animDuration * 100;

            const iteration = 12 * getRandomNumber(1, 2);
            let multiplier = getRandomNumber(0 + iteration, 11 + iteration);
            randomIndex = multiplier - iteration;
            randomSymbol = SYMBOLS[randomIndex];
            multiplier = multiplier * DEG_GAP;

            //console.log('LOG.................', randomIndex, randomSymbol) // TODO => WIN CONDITION ... Same symbol in row

            reelAnimation(animDuration, multiplier);

            if (isFirstPlay.value) {
                setProgress(progressCounter);
                isFirstPlay.value = false;
            }
            if (progressCounter >= 180) {
                progressCounter = 0;
                setProgress(progressCounter);
            }

            setTimeout(() => {
                progressCounter += PROGRESS_INCREMENT;
                isPlaying = false;
                refSymbols.value[randomIndex].classList.add('spin-end');
                setProgress(progressCounter);
            }, animDuration);
        }

        const reelAnimation = (duration, multiplier) => {
            const lastDeg = getRotationDegrees(getComputedStyle(refSymbolContainers.value[0]).transform);

            let degStartContainer = lastDeg;
            let degEndContainer = lastDeg + 330 + multiplier;

            let degStartSymbol = -lastDeg;
            let degEndSymbol = -lastDeg - 330 - multiplier;

            for (let i = 0; i < REEL_LENGTH; i++) {

                if (i !== 0) {
                    degStartContainer += DEG_GAP;
                    degEndContainer += DEG_GAP;

                    degStartSymbol -= DEG_GAP;
                    degEndSymbol -= DEG_GAP;
                }

                const animContainerKeyframes = [
                    {
                        transform: `translate(-50%, -100%) rotate(${degStartContainer + 'deg'})`
                    },
                    {
                        transform: `translate(-50%, -100%) rotate(${degEndContainer + 'deg'})`
                    }
                ];
                const animSymbolKeyframes = [
                    {
                        transform: `translate(-50%, -50%) rotate(${degStartSymbol + 'deg'})`,
                        top: isFirstPlay.value ? 'calc(15% + 20px)' : '100%',
                        height: isFirstPlay.value ? '30%' : '80%'
                    },
                    {
                        top: 'calc(15% + 20px)',
                        height: '30%'
                    },
                    {
                        top: 'calc(15% + 20px)',
                        height: '30%'
                    },
                    {
                        transform: `translate(-50%, -50%) rotate(${degEndSymbol + 'deg'})`,
                        top: '100%',
                        height: '80%'
                    }
                ];

                const animProperties = {
                    duration: duration,
                    iterations: 1,
                    easing: 'ease-in-out',
                    fill: 'forwards'
                };

                refSymbolContainers.value[i].animate(animContainerKeyframes, animProperties);
                refSymbols.value[i].animate(animSymbolKeyframes, animProperties);

                setTimeout(() => {
                    if (i === randomIndex) refSymbolContainers.value[i].style.zIndex = '2';
                    else refSymbolContainers.value[i].style.zIndex = '1';
                }, duration / 2);
            }
        }



        // UTILS

        const getRotationDegrees = (matrix) => {
            const values = matrix.match(/matrix\(([^)]+)\)/)[1].split(',').map(parseFloat);

            const a = values[0];
            const b = values[1];

            const radians = Math.atan2(b, a);
            let degrees = radians * (180 / Math.PI);
            degrees = (degrees + 360) % 360;
            degrees = parseInt(Math.round(degrees));

            return degrees;
        }

        const setProgress = (progress) => {
            const circleDimension = 2 * (progressDimension.value - 10) * Math.PI;
            const circleDegree = (progress / 360) * circleDimension;

            refProgressLeft.value.style.strokeDasharray = `${circleDegree}, ${circleDimension - circleDegree}`;
            refProgressLeft.value.style.strokeDashoffset = (circleDegree / 2) + (circleDimension / 2);
            refProgressLeft.value.style.strokeLinecap = progress < 180 ? 'round' : 'butt';

            refProgressRight.value.style.strokeDasharray = `${circleDegree}, ${circleDimension - circleDegree}`;
            refProgressRight.value.style.strokeDashoffset = circleDegree / 2;
            refProgressRight.value.style.strokeLinecap = progress < 180 ? 'round' : 'butt';
        }



        // INIT

        onMounted(() => {
            progressDimension.value = refSymbolContainers.value[0].getBoundingClientRect().height;
            if (isWatch.value) window.addEventListener('resize', () => progressDimension.value = refSymbolContainers.value[0].getBoundingClientRect().height);

            let degStartContainer = 0;
            let degEndContainer = 330;

            let degStartSymbol = 0;
            let degEndSymbol = -330;

            for (let i = 0; i < REEL_LENGTH; i++) {
                if (i !== 0) {
                    degStartContainer += DEG_GAP;
                    degStartSymbol -= DEG_GAP;
                }
                if (i !== 0) {
                    degEndContainer += DEG_GAP;
                    degEndSymbol -= DEG_GAP;
                }

                refSymbolContainers.value[i].style.transform = `translate(-50%, -100%) rotate(${degStartContainer + 'deg'})`;
                refSymbols.value[i].style.transform = `translate(-50%, -50%) rotate(${degStartSymbol + 'deg'})`;
                refSymbols.value[i].style.top = 'calc(15% + 20px)';
                refSymbols.value[i].style.height = '30%';
            }

            setProgress(180);

            isLoaded = true;
        });

        return {
            isWatch,
            assetsUrl,
            SYMBOLS,
            refGame,
            refSymbolContainers,
            refSymbols,
            refProgressLeft,
            refProgressRight,
            progressDimension,
            REEL_LENGTH,
            spin,
            isFirstPlay
        }
    }
}
</script>

<style scoped>
#spin-watch {
    color: var(--spinwatch-secondary);
}
.dimension {
    width: 100%;
    height: 100dvh;
    height: 100vh;
}

#spin-watch.no-watch::after {
    content: "";
    background-color: var(--spinwatch-secondary);
    box-shadow: 0px 0px 5px 5px rgba(var(--spinwatch-secondary-rgb), 0.5);
    height: 100%;
    width: 120px;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    z-index: -1;
}
#spin-watch-container {
    background-color: var(--spinwatch--silver);
}
#spin-watch-container.no-watch {
    border-radius: 50%;
    background-color: transparent;
}

#game {
    width: 100%;
    aspect-ratio: 1;
    background-color: var(--spinwatch--silver);
    border-radius: 50%;
}
#game.no-watch {
    box-shadow: 0px 0px 5px 5px rgba(var(--spinwatch-secondary-rgb), 0.5);
}
#game::after {
    content: "";
    width: calc(100% - (20px * 2));
    aspect-ratio: 1;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
    border-radius: 50%;
    animation: circleShadowAnimation 2s infinite ease-in-out;
}
@keyframes circleShadowAnimation {
    from,
    to {
        box-shadow: inset 0px 0px 1rem 0 rgba(var(--spinwatch-main-rgb), 1);
    }
    50% {
        box-shadow: inset 0px 0px 1rem 0 rgba(var(--spinwatch-main-rgb), 0.5);
    }
}

i.fa-circle-play {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
    font-size: 12rem;
    box-shadow: inset 0px 0px 2rem 1rem var(--spinwatch-main);
    border-radius: 50%;
}



.symbol-container {
    position: absolute;
    height: 50%;
    top: 50%;
    left: 50%;
    transform-origin: 50% 100%;
    z-index: 2;
}
.symbol {
    aspect-ratio: 1;
    position: absolute;
    left: 50%;
    border-radius: 5px;
    transition: 0.3s ease-in-out;
}
.symbol.spin-end {
    background-color: var(--spinwatch-gold);
    box-shadow: 0px 0px 5px 5px rgba(var(--spinwatch-gold-rgb), 0.8);
}

svg {
    width: 100%;
    height: 100%;
}
circle {
    fill: none;
    stroke-width: 20px;
    transition: stroke-dasharray 0.3s ease-in-out, stroke-dashoffset 0.3s ease-in-out, stroke-linecap 0.3s ease-in-out;
    animation: circleAnimation 2s infinite ease-in-out;
}
@keyframes circleAnimation {
    from,
    to {
        stroke: rgba(var(--spinwatch-main-rgb), 1);
    }
    50% {
        stroke: rgba(var(--spinwatch-main-rgb), 0.5);
    }
}
</style>