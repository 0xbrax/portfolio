<template>
    <div id="spin-watch" class="d-flex justify-ctr align-ctr">
        <div id="spin-watch-container" class="d-flex justify-ctr align-ctr">
            <div @click="spin()" ref="refGame" id="game" class="d-flex justify-ctr align-ctr relative">
                <div 
                    class="symbol-container"
                    v-for="el in new Array(REEL_LENGTH)" 
                    :key="el"
                    :ref="(container) => refSymbolContainers.push(container)"
                >
                    <div class="symbol" :ref="(symbol) => refSymbols.push(symbol)"></div>
                </div>

                <svg>
                    <circle 
                        ref="refProgress"
                        :cx="progressDimension" 
                        :cy="progressDimension" 
                        :r="progressDimension" 
                    />
                </svg>
            </div>
        </div>
    </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import { getRandomNumber } from '@/assets/js/utils.js';

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

        let isLoaded = false;

        const spin = () => {
            // TODO Reset degree if position is === start position
            if (!isLoaded) return;

            let animDuration = getRandomNumber(10, 15);
            animDuration = animDuration * 1000;

            const iteration = 12 * getRandomNumber(1, 3);
            let multiplier = getRandomNumber(0 + iteration, 11 + iteration);
            multiplier = multiplier * DEG_GAP;

            reelAnimation(animDuration, multiplier);
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

                const animKeyContainerFrames = [
                    {
                        transform: `translate(-50%, -100%) rotate(${degStartContainer + 'deg'})`
                    },
                    {
                        transform: `translate(-50%, -100%) rotate(${degEndContainer + 'deg'})`
                    }
                ];
                const animKeySymbolFrames = [
                    {
                        transform: `translate(-50%, -50%) rotate(${degStartSymbol + 'deg'})`,
                        top: '100%',
                        height: '80%'
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

                refSymbolContainers.value[i].animate(animKeyContainerFrames, animProperties);
                refSymbols.value[i].animate(animKeySymbolFrames, animProperties);
            }
        }



        // TODO remove
        const getRandomColor = () => {
            const letters = '0123456789ABCDEF';
            let color = '#';
            for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }

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
                refSymbols.value[i].style.top = '100%';
                refSymbols.value[i].style.height = '80%';

                refSymbols.value[i].style.backgroundColor = getRandomColor();
            }




            let progress = 145;

            const circleDimension = 2 * progressDimension.value * Math.PI;
            const circleDegree = (progress / 360) * circleDimension;
            refProgress.value.style.strokeDasharray = `${circleDegree}, ${circleDimension - circleDegree}`;
            refProgress.value.style.strokeDashoffset = circleDegree / 2;

            console.log(circleDimension, circleDegree)


            /*console.log(refSymbolContainers.value[0])

            refSymbolContainers.value[0].addEventListener('animationend', () => {
                console.log('WEEE')
            });*/

            isLoaded = true;
        });

        return {
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
    z-index: 1;
    width: 4px;
    height: 50%;
    background: yellow;
    top: 50%;
    left: 50%;
    transform-origin: 50% 100%;
}
.symbol {
    aspect-ratio: 1;

    position: absolute;
    left: 50%;

    box-shadow: inset 0px 20px 0px 0px black;
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