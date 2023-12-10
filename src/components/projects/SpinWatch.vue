<template>
    <div id="spin-watch" class="d-flex justify-ctr align-ctr">
        <div id="spin-watch-container" class="d-flex justify-ctr align-ctr">
            <div @click="spin()" ref="refGame" id="game" class="d-flex justify-ctr align-ctr relative">
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
                        ref="refProgress"
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
        const refGame = ref(null);
        const refSymbolContainers = ref([]);
        const refSymbols = ref([]);
        const refProgress = ref(null);
        const progressDimension = ref();

        const REEL_LENGTH = 12;
        const DEG_GAP = 30;

        const SYMBOLS = ['o', 'bar-1', 'x-w', 'bar-3', 'x-b', 'bar-2', 'o', 'bar-3', 'x-w', 'bar-1', 'x-b', 'bar-2'];
        let winIndex;
        let winSymbol;

        let isFirstPlay = true;
        let isLoaded = false;
        let isPlaying = false;

        const spin = () => {
            // TODO Reset degree if position is === start position => JS MAX NUMBER (degree > max when play hard)...
            if (!isLoaded || isPlaying) return;

            if (winIndex != null) refSymbols.value[winIndex].classList.remove('spin-end');

            isPlaying = true;
            let animDuration = getRandomNumber(15, 20);
            animDuration = animDuration * 100;

            const iteration = 12 * getRandomNumber(1, 2);
            let multiplier = getRandomNumber(0 + iteration, 11 + iteration);
            winIndex = multiplier - iteration;
            winSymbol = SYMBOLS[winIndex];
            multiplier = multiplier * DEG_GAP;

            console.log('LOG.................', winIndex, winSymbol)

            reelAnimation(animDuration, multiplier);

            setTimeout(() => {
                isPlaying = false;
                refSymbols.value[winIndex].classList.add('spin-end');
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
                    degStartSymbol -= DEG_GAP;
                }
                if (i !== 0) {
                    degEndContainer += DEG_GAP;
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
                        top: isFirstPlay ? 'calc(15% + 20px)' : '100%',
                        height: isFirstPlay ? '30%' : '80%'
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
                    if (i === winIndex) refSymbolContainers.value[i].style.zIndex = '2';
                    else refSymbolContainers.value[i].style.zIndex = '1';
                }, duration / 2);
            }

            isFirstPlay = false;
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



        // INIT

        onMounted(() => {
            progressDimension.value = refSymbolContainers.value[0].getBoundingClientRect().height;

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



            /////////////////// TODO
            let progress = 120;

            const circleDimension = 2 * (progressDimension.value - 10) * Math.PI;
            const circleDegree = (progress / 360) * circleDimension;
            refProgress.value.style.strokeDasharray = `${circleDegree}, ${circleDimension - circleDegree}`;
            refProgress.value.style.strokeDashoffset = circleDegree / 2;

            isLoaded = true;
        });

        return {
            assetsUrl,
            SYMBOLS,
            refGame,
            refSymbolContainers,
            refSymbols,
            refProgress,
            progressDimension,
            REEL_LENGTH,
            spin
        }
    }
}
</script>

<style scoped>
#spin-watch {
    width: 100%;
    height: 100dvh;
    height: 100vh;

    background-color: bisque;
}
#spin-watch-container {
    width: 400px;
    height: 500px;

    background-color: aqua;
}

#game {
    width: 100%;
    aspect-ratio: 1;

    background-color: rgb(255, 187, 0);
    border-radius: 50%;
}



.symbol-container {
    position: absolute;
    height: 50%;
    top: 50%;
    left: 50%;
    transform-origin: 50% 100%;
}
.symbol {
    aspect-ratio: 1;
    position: absolute;
    left: 50%;
    transition: 0.3s ease-in-out;
}
.symbol.spin-end {
    background-color: rgba(255, 255, 255, 0.8);
    box-shadow: 0px 0px 5px 5px rgba(255, 255, 255, 0.8);
}

svg {
    width: 100%;
    height: 100%;
}
circle {
    fill: none;
    stroke-width: 20px;
    stroke: rgb(4, 0, 255);

    transition: stroke-dasharray 0.3s ease-in-out;
}
</style>