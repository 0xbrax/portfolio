<template>
    <div class="d-flex">
        <div id="tachometer-container">
            <div class="mark-container">
                <div class="circular-progress">
                    <div class="segment-mask"></div>

                    <div class="segment blue" style="transform: rotate(130deg) skew(50deg)"></div>
                    <div class="segment green" style="transform: rotate(170deg) skew(170deg)"></div>
                    <div class="segment green" style="transform: rotate(270deg) skew(170deg)"></div>
                    <div class="segment red" style="transform: rotate(10deg) skew(50deg)"></div>
                </div>
                
                <div class="mark" v-for="el in new Array(29)" :key="el"></div>
            </div>
            
            <div class="tachometer"></div>
            <div class="rpm-hand-container" ref="rpmHandContainer">
                <div class="rpm-center"></div>
                <div class="rpm-hand"></div>
            </div>
        </div>

        <div class="control-container">
            <div :class="['control pointer', { 'forward': isGoForwardActive, 'backward': isGoBackwardActive }]"></div>

            <div class="level-container level-container-1 pointer" @click="setSpeedLevel(1)"></div>
            <div class="level level-1 pointer" @click="setSpeedLevel(1)"></div>

            <div class="level-container level-container-2 pointer" @click="setSpeedLevel(2)"></div>
            <div class="level level-2 pointer" @click="setSpeedLevel(2)"></div>

            <div class="level-container level-container-3 pointer" @click="setSpeedLevel(3)"></div>
            <div class="level level-3 pointer" @click="setSpeedLevel(3)"></div>
        </div>
    </div>
</template>

<script>
import { inject, onMounted, ref, watch } from "vue";

export default {
    name: 'PlaneControl',

    setup() {
        const isGoForwardActive = inject('isGoForwardActive');
        const isGoBackwardActive = inject('isGoBackwardActive');
        const rpmHandContainer = ref(null);

        const setSpeedLevel = (level) => {
            switch (level) {
                case 1:
                    isGoBackwardActive.value = false;
                    isGoForwardActive.value = true;
                    break;
                case 2:
                    isGoForwardActive.value = false;
                    isGoBackwardActive.value = false;
                    break;
                case 3:
                    isGoForwardActive.value = false;
                    isGoBackwardActive.value = true;
            }
        }

        onMounted(
            () => {
                watch(
                    () => isGoForwardActive.value,
                    (val) => {
                        if (isGoBackwardActive.value) return;

                        if (val) {
                            const animDuration = 200;
                            const animKeyframes = [
                                {
                                    transform: 'translate(-50%, -50%) rotate(76deg)'
                                },
                            ];
                            const animProperties = {
                                duration: animDuration,
                                iterations: 1,
                                easing: 'ease-out'
                            };
                            rpmHandContainer.value.animate(animKeyframes, animProperties);

                            setTimeout(() => {
                                if (!isGoForwardActive.value) return;
                                const animDuration = 500;
                                let animKeyframes = [
                                    {
                                        transform: 'translate(-50%, -50%) rotate(76deg)'
                                    },
                                    {
                                        transform: 'translate(-50%, -50%) rotate(74deg)'
                                    },
                                    {
                                        transform: 'translate(-50%, -50%) rotate(76deg)'
                                    },
                                ];
                                const animProperties = {
                                    duration: animDuration,
                                    iterations: Infinity,
                                    easing: 'ease-in-out'
                                };
                                rpmHandContainer.value.animate(animKeyframes, animProperties);
                            }, 200);
                        }

                        if (!val) {
                            const animDuration = 200;
                            const animKeyframes = [
                                {
                                    transform: 'translate(-50%, -50%) rotate(11deg)'
                                },
                            ];
                            const animProperties = {
                                duration: animDuration,
                                iterations: 1,
                                easing: 'ease-out'
                            };
                            rpmHandContainer.value.animate(animKeyframes, animProperties);

                            setTimeout(() => {
                                if (isGoForwardActive.value) return;
                                const animDuration = 1000;
                                let animKeyframes = [
                                    {
                                        transform: 'translate(-50%, -50%) rotate(11deg)'
                                    },
                                    {
                                        transform: 'translate(-50%, -50%) rotate(9deg)'
                                    },
                                    {
                                        transform: 'translate(-50%, -50%) rotate(11deg)'
                                    },
                                ];
                                const animProperties = {
                                    duration: animDuration,
                                    iterations: Infinity,
                                    easing: 'linear'
                                };
                                rpmHandContainer.value.animate(animKeyframes, animProperties);
                            }, 200);
                        }
                    },
                    { 
                        immediate: true
                    }
                );
                watch(
                    () => isGoBackwardActive.value,
                    (val) => {
                        if (isGoForwardActive.value) return;

                        if (val) {
                            const animDuration = 200;
                            const animKeyframes = [
                                {
                                    transform: 'translate(-50%, -50%) rotate(-56deg)'
                                },
                            ];
                            const animProperties = {
                                duration: animDuration,
                                iterations: 1,
                                easing: 'ease-out'
                            };
                            rpmHandContainer.value.animate(animKeyframes, animProperties);

                            setTimeout(() => {
                                if (!isGoBackwardActive.value) return;
                                const animDuration = 1500;
                                let animKeyframes = [
                                    {
                                        transform: 'translate(-50%, -50%) rotate(-56deg)'
                                    },
                                    {
                                        transform: 'translate(-50%, -50%) rotate(-54deg)'
                                    },
                                    {
                                        transform: 'translate(-50%, -50%) rotate(-56deg)'
                                    },
                                ];
                                const animProperties = {
                                    duration: animDuration,
                                    iterations: Infinity,
                                    easing: 'ease-in-out'
                                };
                                rpmHandContainer.value.animate(animKeyframes, animProperties);
                            }, 200);
                        }

                        if (!val) {
                            const animDuration = 200;
                            const animKeyframes = [
                                {
                                    transform: 'translate(-50%, -50%) rotate(11deg)'
                                },
                            ];
                            const animProperties = {
                                duration: animDuration,
                                iterations: 1,
                                easing: 'ease-out'
                            };
                            rpmHandContainer.value.animate(animKeyframes, animProperties);

                            setTimeout(() => {
                                if (isGoBackwardActive.value) return;
                                const animDuration = 1000;
                                let animKeyframes = [
                                    {
                                        transform: 'translate(-50%, -50%) rotate(11deg)'
                                    },
                                    {
                                        transform: 'translate(-50%, -50%) rotate(9deg)'
                                    },
                                    {
                                        transform: 'translate(-50%, -50%) rotate(11deg)'
                                    },
                                ];
                                const animProperties = {
                                    duration: animDuration,
                                    iterations: Infinity,
                                    easing: 'linear'
                                };
                                rpmHandContainer.value.animate(animKeyframes, animProperties);
                            }, 200);
                        }
                    },
                    { 
                        immediate: true
                    }
                );
            }
        );

        return {
            rpmHandContainer,
            setSpeedLevel,
            isGoForwardActive,
            isGoBackwardActive
        }
    }
}
</script>

<style scoped>
/**** TACHOMETER ****/
#tachometer-container {
    position: relative;
    width: 200px;
    aspect-ratio: 1 / 1;
    background: linear-gradient(#333333, #000000);
    border-radius: 50%;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.4);

    margin-right: 50px;
}

.mark-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 180px;
    aspect-ratio: 1 / 1;
    background: linear-gradient(#444444, #111111);
    border-radius: 50%;
    overflow: hidden;
}
.circular-progress {
    position: relative;
    z-index: 1;
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 50%;
}
.segment-mask {
    position: absolute;
    z-index: 2;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 95%;
    aspect-ratio: 1 / 1;
    border-radius: 50%;
    background: linear-gradient(#444444, #111111);
}
.segment {
    position: absolute;
    z-index: 1;
    top: 50%;
    left: 50%;
    width: 75%;
    aspect-ratio: 1 / 1;
    transform-origin: 0 0;
}
.blue {
    background-color: #0000ff;
}
.green {
    background-color: #32cd32;
}
.red {
    background-color: #ff0000;
}

.tachometer {
    width: 130px;
    aspect-ratio: 1 / 1;
    background: linear-gradient(#555555, #222222);
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
}
.rpm-hand-container {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 3;
    transform: translate(-50%, -50%) rotate(11deg);
}
.rpm-center {
    width: 40px;
    aspect-ratio: 1 / 1;
    background-color: #000000;
    border-radius: 50%;
    border: 2px solid #ffffff;
}
.rpm-hand {
    width: 10px;
    height: 65px;
    background-color: #000000;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, -96.1%);
    border-radius: calc(100% / 3) calc(100% / 3) 0 0;
    border: 2px solid #ffffff;
    border-bottom: 0;
    border-top-color: #ff0000;
    border-top-width: 7px;
}

.mark {
    position: absolute;
    z-index: 1;
    width: 5px;
    height: 50%;
    background: linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 20%, rgba(255,255,255,0) 20%, rgba(255,255,255,0) 100%);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -100%) rotate(0deg);
    transform-origin: 50% 100%;
}

.mark:nth-child(1) { transform: translate(-50%, -100%) rotate(0deg); }
.mark:nth-child(2) { transform: translate(-50%, -100%) rotate(10deg); }
.mark:nth-child(3) { transform: translate(-50%, -100%) rotate(20deg); background: linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 30%, rgba(255,255,255,0) 30%, rgba(255,255,255,0) 100%); }
.mark:nth-child(4) { transform: translate(-50%, -100%) rotate(30deg); }
.mark:nth-child(5) { transform: translate(-50%, -100%) rotate(40deg); }
.mark:nth-child(6) { transform: translate(-50%, -100%) rotate(50deg); }
.mark:nth-child(7) { transform: translate(-50%, -100%) rotate(60deg); background: linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 30%, rgba(255,255,255,0) 30%, rgba(255,255,255,0) 100%); }
.mark:nth-child(8) { transform: translate(-50%, -100%) rotate(70deg); }
.mark:nth-child(9) { transform: translate(-50%, -100%) rotate(80deg); }
.mark:nth-child(10) { transform: translate(-50%, -100%) rotate(90deg); }
.mark:nth-child(11) { transform: translate(-50%, -100%) rotate(100deg); background: linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 30%, rgba(255,255,255,0) 30%, rgba(255,255,255,0) 100%); }
.mark:nth-child(12) { transform: translate(-50%, -100%) rotate(110deg); }
.mark:nth-child(13) { transform: translate(-50%, -100%) rotate(120deg); }
.mark:nth-child(14) { transform: translate(-50%, -100%) rotate(130deg); }
.mark:nth-child(15) { transform: translate(-50%, -100%) rotate(140deg); background: linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 30%, rgba(255,255,255,0) 30%, rgba(255,255,255,0) 100%); }

.mark:nth-child(16) { transform: translate(-50%, -100%) rotate(220deg); background: linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 30%, rgba(255,255,255,0) 30%, rgba(255,255,255,0) 100%); }
.mark:nth-child(17) { transform: translate(-50%, -100%) rotate(230deg); }
.mark:nth-child(18) { transform: translate(-50%, -100%) rotate(240deg); }
.mark:nth-child(19) { transform: translate(-50%, -100%) rotate(250deg); }
.mark:nth-child(20) { transform: translate(-50%, -100%) rotate(260deg); background: linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 30%, rgba(255,255,255,0) 30%, rgba(255,255,255,0) 100%); }
.mark:nth-child(21) { transform: translate(-50%, -100%) rotate(270deg); }
.mark:nth-child(22) { transform: translate(-50%, -100%) rotate(280deg); }
.mark:nth-child(23) { transform: translate(-50%, -100%) rotate(290deg); }
.mark:nth-child(24) { transform: translate(-50%, -100%) rotate(300deg); background: linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 30%, rgba(255,255,255,0) 30%, rgba(255,255,255,0) 100%); }
.mark:nth-child(25) { transform: translate(-50%, -100%) rotate(310deg); }
.mark:nth-child(26) { transform: translate(-50%, -100%) rotate(320deg); }
.mark:nth-child(27) { transform: translate(-50%, -100%) rotate(330deg); }
.mark:nth-child(28) { transform: translate(-50%, -100%) rotate(340deg); background: linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 30%, rgba(255,255,255,0) 30%, rgba(255,255,255,0) 100%); }
.mark:nth-child(29) { transform: translate(-50%, -100%) rotate(350deg); }



/**** SPEED ****/
.control-container {
    position: relative;
    width: 120px;
    height: 200px;
    background: linear-gradient(#555555, #222222);
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.control {
    position: absolute;
    z-index: 2;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100px;
    height: 60px;
    background: linear-gradient(#ff0000, #990000);
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    transition: top 0.2s ease-in-out;
}
.forward {
    top: 40px;
}
.backward {
    top: 160px;
}

.level-container {
    width: 100px;
    height: 60px;
    border-radius: 10px;
    box-shadow: inset 0px 0px 0px 2px #000000;
    position: absolute;
    z-index: 1;
    left: 50%;
    transform: translate(-50%, -50%);
}
.level-container-1 {
    top: 40px;
}
.level-container-2 {
    top: 50%;
}
.level-container-3 {
    top: 160px;
}

.level {
    position: absolute;
    z-index: 3;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 10px;
    background: linear-gradient(to right, #aaaaaa, #dddddd);
    border-radius: 5px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
}
.level-1 { width: 60px; top: 40px; }
.level-2 { width: 45px; top: 50%; }
.level-3 { width: 30px; top: 160px; }



/**** MEDIA ****/
@media all and (min-width: 576px) {
    #tachometer-container {
        margin-right: 400px;
    }
}
</style>