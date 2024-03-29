<template>
    <div id="spin-watch" :class="['d-flex justify-ctr align-ctr relative', { 'dimension no-watch': !isWatch }]">
        <router-link v-if="!isWatch" to="/"><i class="fas fa-house"></i></router-link>

        <div id="spin-watch-container" :class="['d-flex justify-ctr align-ctr', { 'dimension': isWatch, 'no-watch': !isWatch }]">            
            <div @touchstart="isWatch ? spin() : undefined" @mousedown="!isWatch ? spin() : undefined" ref="refGame" id="game" :class="['d-flex justify-ctr align-ctr relative', { 'no-watch': !isWatch }]">
                <transition name="icon">
                    <i v-if="isFirstPlay" class="far fa-circle-play"></i>
                </transition>
                <transition name="win">
                    <div v-if="isWinActive" id="win-screen" :class="['d-flex justify-ctr align-ctr text-ctr', { 'win-animation': isWinActive }]">
                        You<br/>
                        rock!
                    </div>
                </transition>
                
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
import { onMounted, ref, nextTick, watch } from 'vue';
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
        const isWinActive = ref(false);

        const REEL_LENGTH = 12;
        const DEG_GAP = 30;

        // conditions ratio 3 : 1 because you need 3 spin to win => 9 (4 + 5) : 3 => 50 : 50
        const CONDITIONS = [...Array(4).fill('lose'), ...Array(5).fill('fake-win'), ...Array(3 + 1).fill('win')];
        const conditionObj = {
            selectedCondition: null,
            prevCondition: null,
            conditionCounter: 0,
            prevIndex: null,
        };

        const SYMBOLS = ['o', 'bar-1', 'x-w', 'bar-3', 'x-b', 'bar-2', 'o', 'bar-3', 'x-w', 'bar-1', 'x-b', 'bar-2'];
        let randomIndex;
        const animTriggerRef = ref(0);
        const degEndObj = {
            containers: {},
            symbols: {}
        }

        const isFirstPlay = ref(true);
        let isLoaded = false;
        let isPlaying = false;

        let progressCounter = 0;
        const PROGRESS_INCREMENT = 60;

        const spin = () => {
            if (isWinActive.value) {
                refSymbols.value[randomIndex].classList.remove('spin-end');
                progressCounter = 0;
                setProgress(progressCounter);
                isWinActive.value = false;
                isFirstPlay.value = true;
                winInitSymbols();
                return;
            }

            if (!isLoaded || isPlaying) return;

            isPlaying = true;

            if (randomIndex != null && !isWinActive.value) refSymbols.value[randomIndex].classList.remove('spin-end');
            let animDuration = getRandomNumber(20, 25);
            animDuration = animDuration * 100;


            //////// start conditions algorythm
            if (conditionObj.prevCondition === 'fake-win' && conditionObj.conditionCounter === 1 || conditionObj.prevCondition === 'win' && conditionObj.conditionCounter === 2) {
                conditionObj.selectedCondition = null;
                conditionObj.conditionCounter = 0;
            }

            conditionObj.prevCondition = conditionObj.selectedCondition;
            
            do {
                randomIndex = getRandomNumber(0, 11);
            } while (conditionObj.prevIndex != null && SYMBOLS[randomIndex] === SYMBOLS[conditionObj.prevIndex]);

            if (conditionObj.prevCondition === 'fake-win' || (conditionObj.prevCondition === 'win' && conditionObj.conditionCounter === 0)) {
                conditionObj.selectedCondition = conditionObj.prevCondition;
                randomIndex = conditionObj.prevIndex;
                conditionObj.conditionCounter = 1;
            } else if (conditionObj.prevCondition === 'win' && conditionObj.conditionCounter === 1) {
                conditionObj.selectedCondition = conditionObj.prevCondition;
                randomIndex = conditionObj.prevIndex;
                conditionObj.conditionCounter = 2;
            } else {
                conditionObj.selectedCondition = CONDITIONS[getRandomNumber(0 , CONDITIONS.length -1)];
                conditionObj.prevIndex = randomIndex;
            }
            //////// end conditions algorythm


            const iteration = 12 * getRandomNumber(1, 2);
            let multiplier = getRandomNumber(randomIndex + iteration, randomIndex + iteration);
            multiplier = multiplier * DEG_GAP;

            reelAnimation(animDuration, multiplier);

            if (isFirstPlay.value) {
                setProgress(progressCounter);
                isFirstPlay.value = false;
            }

            if (conditionObj.conditionCounter === 0) {
                progressCounter = 0;
            }
        }

        const reelAnimation = (duration, multiplier) => {
            animTriggerRef.value = 0;
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
                        transform: `translate(-50%, -50%) rotate(${(degStartSymbol * 2) + 'deg'})`,
                        top: 'calc(15% + 20px)',
                        height: '30%'
                    },
                    {
                        transform: `translate(-50%, -50%) rotate(${(degEndSymbol / 2) + 'deg'})`,
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
                    easing: 'ease-in-out'
                };

                const animContainer = refSymbolContainers.value[i].animate(animContainerKeyframes, animProperties);
                const animSymbol = refSymbols.value[i].animate(animSymbolKeyframes, animProperties);

                const animHalfTime = setTimeout(() => {
                    if (i === randomIndex) refSymbolContainers.value[i].style.zIndex = '2';
                    else refSymbolContainers.value[i].style.zIndex = '1';
                }, duration / 2);

                degEndObj.containers[i] = degEndContainer;
                degEndObj.symbols[i] = degEndSymbol;

                animContainer.onfinish = () => {
                    if (i === 0) animTriggerRef.value = 1;
                    
                    animContainer.cancel();
                    animSymbol.cancel();
                    clearTimeout(animHalfTime);

                    refSymbolContainers.value[i].style.transform = `translate(-50%, -100%) rotate(${degEndObj.containers[i] + 'deg'})`;
                    refSymbols.value[i].style.transform = `translate(-50%, -50%) rotate(${degEndObj.symbols[i] + 'deg'})`;
                    refSymbols.value[i].style.top = '100%';
                    refSymbols.value[i].style.height = '80%';
                };
            }
        }

        watch(
            () => animTriggerRef.value,
            (val) => {
                if (val === 0) return;

                if (conditionObj.conditionCounter === 1 || conditionObj.conditionCounter === 2) {
                    progressCounter += PROGRESS_INCREMENT;
                } else {
                    progressCounter = PROGRESS_INCREMENT;
                }
                
                refSymbols.value[randomIndex].classList.add('spin-end');
                setProgress(progressCounter);
                if (conditionObj.selectedCondition === 'win' && conditionObj.conditionCounter === 2) {
                    isWinActive.value = true;
                }

                isPlaying = false;
            }
        );



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

        const firstPlayInitSymbols = () => {
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
        }

        const winInitSymbols = () => {
            const lastDeg = getRotationDegrees(getComputedStyle(refSymbolContainers.value[0]).transform);

            let degStartContainer = lastDeg;
            let degEndContainer = lastDeg + 330;

            let degStartSymbol = -lastDeg;
            let degEndSymbol = -lastDeg - 330;

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
                        top: '100%',
                        height: '80%'
                    },
                    {
                        transform: `translate(-50%, -50%) rotate(${degEndSymbol + 'deg'})`,
                        top: 'calc(15% + 20px)',
                        height: '30%'
                    }
                ];

                const animProperties = {
                    duration: 300,
                    iterations: 1,
                    easing: 'ease-in-out'
                };

                const animContainer = refSymbolContainers.value[i].animate(animContainerKeyframes, animProperties);
                const animSymbol = refSymbols.value[i].animate(animSymbolKeyframes, animProperties);

                degEndObj.containers[i] = degEndContainer;
                degEndObj.symbols[i] = degEndSymbol;

                animContainer.onfinish = () => {
                    animContainer.cancel();
                    animSymbol.cancel();

                    refSymbolContainers.value[i].style.transform = `translate(-50%, -100%) rotate(${degEndObj.containers[i] + 'deg'})`;
                    refSymbols.value[i].style.transform = `translate(-50%, -50%) rotate(${degEndObj.symbols[i] + 'deg'})`;
                    refSymbols.value[i].style.top = 'calc(15% + 20px)';
                    refSymbols.value[i].style.height = '30%';
                };
            }
        }



        // INIT
        document.title = '0xbrax | Spin Watch';

        onMounted(() => {
            nextTick(() => {
                progressDimension.value = refSymbolContainers.value[0].getBoundingClientRect().height;
                setProgress(180);

                window.addEventListener('keydown', (e) => e.code === 'Space' && spin());
            });

            window.addEventListener('resize', () => {
                isWatch.value = window.screen.width <= 550 && window.screen.height <= 550;

                nextTick(() => {
                    progressDimension.value = refSymbolContainers.value[0].getBoundingClientRect().height;
                });
            });

            firstPlayInitSymbols();

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
            isFirstPlay,
            isWinActive
        }
    }
}
</script>

<style scoped>
#spin-watch {
    overflow: hidden;
    color: var(--spinwatch-secondary);
}
.dimension {
    width: 100%;
    height: 100vh;
    height: 100dvh;
}

i.fa-house {
    color: #000000;
    font-size: 25px;
    width: 50px;
    aspect-ratio: 1/ 1;
    line-height: 50px;
    text-align: center;
    background-color: rgba(0, 0, 0, 0.2);
    text-shadow: none;
    border-radius: 50%;
    position: absolute;
    top: 25px;
    left: 25px;
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
}
i.fa-house:hover {
    background-color: rgba(0, 0, 0, 0.3);
}


#spin-watch.no-watch::after {
    content: "";
    background-color: var(--spinwatch-secondary);
    box-shadow: 0 0 5px 5px rgba(var(--spinwatch-secondary-rgb), 0.5);
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
    width: 90%;
    aspect-ratio: 1;
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
    box-shadow: 0 0 5px 5px rgba(var(--spinwatch-secondary-rgb), 0.5);
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
    animation: circleShadowAnimation 3s infinite ease-in-out;
}
@keyframes circleShadowAnimation {
    from,
    to {
        box-shadow: inset 0 0 10px 0 rgba(var(--spinwatch-main-rgb), 1);
    }
    50% {
        box-shadow: inset 0 0 0 0 rgba(var(--spinwatch-main-rgb), 0.5);
    }
}

i.fa-circle-play {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
    font-size: 150px;
    box-shadow: inset 0 0 20px 10px var(--spinwatch-main);
    border-radius: 50%;
}

#win-screen {
    width: calc(100% - 40px);
    aspect-ratio: 1;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(0deg);
    z-index: 9; 
    border-radius: 50%;
    
    font-size: 50px;
    font-weight: bold;
    text-transform: uppercase;
}
#win-screen.win-animation {
    animation: winAnimation 3s infinite ease-in-out, winRotateAnimation 6s infinite linear;
}
@keyframes winAnimation {
    from,
    to {
        background-color: rgba(var(--spinwatch-gold-rgb), 0.8);
        outline: 20px solid var(--spinwatch--silver);
        outline-offset: -40px;
    }
    50% {
        background-color: rgba(var(--spinwatch-gold-rgb), 0.5);
        outline: 10px solid var(--spinwatch--silver);
        outline-offset: 5px;
    }
}
@keyframes winRotateAnimation {
    from {
        transform: translate(-50%, -50%) rotate(0deg);
    }
    to {
        transform: translate(-50%, -50%) rotate(-360deg);
    }
}

.icon-enter-active,
.icon-leave-active,
.win-enter-active,
.win-leave-active {
    transition: opacity 0.3s ease-in-out;
}
.icon-enter-from,
.icon-leave-to,
.win-enter-from,
.win-leave-to {
    opacity: 0;
}
.icon-enter-to,
.icon-leave-from,
.win-enter-to,
.win-leave-from {
    opacity: 1;
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
    border-radius: 50%;
    transition: background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}
.symbol.spin-end {
    background-color: var(--spinwatch-gold);
    box-shadow: 0 0 5px 20px var(--spinwatch-gold);
}

svg {
    width: 100%;
    height: 100%;
}
circle {
    fill: none;
    stroke-width: 20px;
    transition: stroke-dasharray 0.3s ease-in-out, stroke-dashoffset 0.3s ease-in-out, stroke-linecap 0.3s ease-in-out;
    animation: circleAnimation 3s infinite ease-in-out;
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



@media all and (min-width: 576px) {
    #spin-watch-container.no-watch {
        width: 360px;
    }
}
</style>