<template>
    <div id="spin-watch" class="d-flex justify-ctr align-ctr" @click="spin()">
        <div id="spin-watch-container" class="d-flex justify-ctr align-ctr">
            <div id="game" class="d-flex justify-ctr align-ctr relative">
                <div 
                    class="symbol-container"
                    v-for="el in new Array(REEL_LENGTH)" 
                    :key="el"
                    :ref="(container) => refSymbolContainers.push(container)"
                >
                    <div class="symbol" :ref="(symbol) => refSymbols.push(symbol)"></div>
                </div>
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
        const refSymbolContainers = ref([]);
        const refSymbols = ref([]);

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
                        top: '100%'
                    },
                    {
                        top: '30px' // 60px (symbol size) / 2
                    },
                    {
                        transform: `translate(-50%, -50%) rotate(${degEndSymbol + 'deg'})`,
                        top: '100%'
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

        onMounted(() => {
            isLoaded = true;

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

                refSymbols.value[i].style.backgroundColor = getRandomColor();
            }
        });

        return {
            refSymbolContainers,
            refSymbols,
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
    width: 50px;
    aspect-ratio: 1;

    position: absolute;
    left: 50%;

    border-top: 10px solid black;
}
</style>