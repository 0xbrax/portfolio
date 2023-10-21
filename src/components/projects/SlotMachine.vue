<template>
    <div id="slot-machine">
        <canvas ref="canvasRef"></canvas>
        <i id="play-btn" class="fas fa-play" @click="spin()"></i>
    </div>
</template>

<script>
    import { ref, onMounted } from "vue";
    import Phaser from "phaser";
    import { gsap } from "gsap";
    import { getRandomNumber } from "@/assets/js/utils.js"

    // apple, arbuz (watermelon), cherry, cocktail, gapefruit, lemon, nut (coconut), pear, pineaple (PP!)
    // check x straw + wild in psd
    // bonus fruit cockatis new background + fx
    import SlotBodyImage from "@/assets/projects/slotmachine/image/main/reel.png";
    import TestImage from "@/assets/projects/slotmachine/image/test/spritesheet.png";
    import TestImage1 from "@/assets/projects/slotmachine/image/test/apple.png";
    import TestImage2 from "@/assets/projects/slotmachine/image/test/arbuz.png";
    import TestImage3 from "@/assets/projects/slotmachine/image/test/cherry.png";
    import TestImage4 from "@/assets/projects/slotmachine/image/test/cocktail.png";
    import TestImage5 from "@/assets/projects/slotmachine/image/test/lemon.png";
    import TestImage6 from "@/assets/projects/slotmachine/image/test/nut.png";
    import TestImage7 from "@/assets/projects/slotmachine/image/test/straw.png";

    export default {
        name: "SlotMachine",

        setup() {
            const canvasRef = ref(null);
            const REEL_LENGTH = 7;

            const IMG_GAP_X = 3;
            const IMG_GAP_Y = 2;

            let reel1Animation;
            let reel2Animation;
            let reel3Animation;
            let reel4Animation;
            let reel5Animation;



            const verticalLoop = (items, config) => {
                items = gsap.utils.toArray(items);
                config = config || {};
                let onChange = config.onChange,
                    lastIndex = 0,
                    tl = gsap.timeline({
                        repeat: config.repeat,
                        onUpdate:
                            onChange &&
                            function () {
                                let i = tl.closestIndex();
                                if (lastIndex !== i) {
                                    lastIndex = i;
                                    onChange(items[i], i);
                                }
                            },
                        paused: config.paused,
                        defaults: { ease: "none" },
                        onReverseComplete: () =>
                            tl.totalTime(tl.rawTime() + tl.duration() * 100),
                    }),
                    length = items.length,
                    startY = items[2].y,
                    times = [],
                    heights = [],
                    curIndex = 0,
                    center = config.center,
                    clone = (obj) => {
                        let result = {},
                            p;
                        for (p in obj) {
                            result[p] = obj[p];
                        }
                        return result;
                    },
                    timeOffset = 0,
                    container = {
                        width: items[0].displayWidth,
                        height: items[0].displayHeight * 3,
                    },
                    totalHeight = startY = items[0].displayHeight * REEL_LENGTH,
                    populateHeights = () => {
                        items.forEach((el, i) => {
                            heights[i] = el.displayHeight;
                        });
                    },
                    timeWrap,
                    populateOffsets = () => {
                        timeOffset = center
                            ? (tl.duration() * (container.width / 2)) /
                              totalHeight
                            : 0;
                        center &&
                            times.forEach((t, i) => {
                                times[i] = timeWrap(
                                    tl.labels["label" + i] +
                                        (tl.duration() * heights[i]) /
                                            2 /
                                            totalHeight -
                                        timeOffset
                                );
                            });
                    },
                    getClosest = (values, value, wrap) => {
                        let i = values.length,
                            closest = 1e10,
                            index = 0,
                            d;
                        while (i--) {
                            d = Math.abs(values[i] - value);
                            if (d > wrap / 2) {
                                d = wrap - d;
                            }
                            if (d < closest) {
                                closest = d;
                                index = i;
                            }
                        }
                        return index;
                    },
                    populateTimeline = () => {
                        let i, item, curY, distanceToStart, distanceToLoop;
                        tl.clear();
                        for (i = 0; i < length; i++) {
                            item = items[i];
                            curY = item.y;
                            distanceToStart = startY - curY - items[0].displayHeight - IMG_GAP_Y; // - container.height;
                            distanceToLoop = distanceToStart + heights[i];
                            tl.to(
                                item,
                                {
                                    y: curY + distanceToLoop,
                                    duration: distanceToLoop
                                },
                                0
                            )
                            .fromTo(
                                item,
                                {
                                    y: curY + distanceToLoop - totalHeight
                                },
                                {
                                    y: curY,
                                    duration: totalHeight - distanceToLoop,
                                    immediateRender: false,
                                },
                                distanceToLoop
                            )
                            .add(
                                "label" + i,
                                distanceToStart
                            );
                            timeWrap = gsap.utils.wrap(0, tl.duration());
                            times[i] = timeWrap(
                                    tl.labels["label" + i] +
                                        (tl.duration() * heights[i]) /
                                            2 /
                                            totalHeight -
                                        timeOffset
                                );
                        }
                        
                    };
                populateHeights();
                populateTimeline();
                populateOffsets();
                function toIndex(index, vars) {
                    vars = clone(vars);
                    index -= 2; // startY gap
                    let newIndex = gsap.utils.wrap(0, length, index),
                        time = times[newIndex];
                    if (time > tl.time() !== index > curIndex) {
                        time += tl.duration() * (index > curIndex ? 1 : -1);
                    }
                    if (vars.revolutions) {
                        time += tl.duration() * Math.round(vars.revolutions);
                        delete vars.revolutions;
                    }
                    if (time < 0 || time > tl.duration()) {
                        vars.modifiers = { time: timeWrap };
                    }
                    curIndex = newIndex;
                    vars.overwrite = true;
                    return tl.tweenTo(time, vars);
                }
                tl.elements = items;
                tl.next = (vars) => toIndex(curIndex + 1, vars);
                tl.previous = (vars) => toIndex(curIndex - 1, vars);
                tl.current = () => curIndex;
                tl.toIndex = (index, vars) => toIndex(index, vars);
                tl.closestIndex = (setCurrent) => {
                    let index = getClosest(times, tl.time(), tl.duration());
                    setCurrent && (curIndex = index);
                    return index;
                };
                tl.times = times;
                tl.progress(1, true).progress(0, true); // pre-render for performance
                if (config.reversed) {
                    tl.vars.onReverseComplete();
                    tl.reverse();
                }
                tl.closestIndex(true);
                onChange && onChange(items[curIndex], curIndex);

                return tl;
            }



            const spin = () => {
                const randomIndex = getRandomNumber(0, REEL_LENGTH - 1);

                console.log('RANDOM', randomIndex, `image: ${randomIndex + 1}`)
                /*import TestImage1 from "@/assets/projects/slotmachine/image/test/apple.png";
                import TestImage2 from "@/assets/projects/slotmachine/image/test/arbuz.png";
                import TestImage3 from "@/assets/projects/slotmachine/image/test/cherry.png";
                import TestImage4 from "@/assets/projects/slotmachine/image/test/cocktail.png";
                import TestImage5 from "@/assets/projects/slotmachine/image/test/lemon.png";
                import TestImage6 from "@/assets/projects/slotmachine/image/test/nut.png";
                import TestImage7 from "@/assets/projects/slotmachine/image/test/straw.png";*/

                reel1Animation.toIndex(randomIndex, { duration: 5.10, revolutions: 20, ease: "power2.inOut" });
                reel2Animation.toIndex(randomIndex, { duration: 5.25, revolutions: 20, ease: "power2.inOut" });
                reel3Animation.toIndex(randomIndex, { duration: 5.42, revolutions: 20, ease: "power2.inOut" });
                reel4Animation.toIndex(randomIndex, { duration: 5.63, revolutions: 20, ease: "power2.inOut" });
                reel5Animation.toIndex(randomIndex, { duration: 5.91, revolutions: 20, ease: "power2.inOut" });
            }



            onMounted(() => {
                class GameScene extends Phaser.Scene {
                    constructor() {
                        super({ key: "gameScene" });

                        this.image;
                        this.test;

                        this.test1;
                        this.test2;
                        this.test3;
                        this.test4;
                        this.test5;
                        this.test6;
                        this.test7;
                    }

                    preload() {
                        this.image = this.load.image("slotBody", SlotBodyImage);
                        this.test = this.load.image("test", TestImage);

                        this.test1 = this.load.image("test1", TestImage1);
                        this.test2 = this.load.image("test2", TestImage2);
                        this.test3 = this.load.image("test3", TestImage3);
                        this.test4 = this.load.image("test4", TestImage4);
                        this.test5 = this.load.image("test5", TestImage5);
                        this.test6 = this.load.image("test6", TestImage6);
                        this.tedt7 = this.load.image("test7", TestImage7);
                    }

                    create() {
                        this.image = this.add
                            .image(0, 0, "slotBody")
                            .setOrigin(0, 0);

                        const ratio = this.image.height / this.image.width;
                        this.image.displayWidth =
                            (canvasRef.value.offsetWidth * 50) / 100;
                        this.image.displayHeight =
                            this.image.displayWidth * ratio;

                        this.image.setPosition(
                            canvasRef.value.offsetWidth / 2 -
                                this.image.displayWidth / 2,
                            canvasRef.value.offsetHeight / 2 -
                                this.image.displayHeight / 2
                        );


                        const generateReel = (xPosition, xGap, yPosition) => {
                            const reel = [];
                            const mask = this.add.graphics();
                            //mask.fillStyle(0xff0000, 1); // DEBUG
                            mask.fillRect(0, 0, 326 * this.image.scaleX, 1017 * this.image.scaleY);
                            mask.setPosition(xPosition + xGap, yPosition + 52);

                            for (let i = 0; i < 7; i++) {
                                const img = this.add.image(
                                    mask.x + 180 / 2 - IMG_GAP_X,
                                    mask.y + 180 * i + 180 / 2 - IMG_GAP_Y,
                                    `test${i + 1}`
                                );

                                img.displayWidth = 180;
                                img.displayHeight = 180;
                                img.setMask(
                                    mask.createGeometryMask()
                                );

                                reel.push(img);
                            }

                            return verticalLoop(reel, {
                                repeat: -1,
                                paused: true,
                                center: true,
                            });
                        }

                        reel1Animation = generateReel(this.image.x, 17, this.image.y);
                        reel2Animation = generateReel(this.image.x, 199, this.image.y);
                        reel3Animation = generateReel(this.image.x, 381, this.image.y);
                        reel4Animation = generateReel(this.image.x, 564, this.image.y);
                        reel5Animation = generateReel(this.image.x, 747, this.image.y);
                    }

                    update() {
                        //
                    }
                }

                const config = {
                    type: Phaser.WEBGL,
                    width: canvasRef.value.offsetWidth,
                    height: canvasRef.value.offsetHeight,
                    canvas: canvasRef.value,
                    transparent: true,
                    scale: {
                        mode: Phaser.Scale.FIT,
                        autoCenter: Phaser.Scale.CENTER_BOTH,
                    },
                    physics: {
                        default: "arcade",
                        arcade: {
                            gravity: { y: 50 },
                            debug: true,
                        },
                    },
                    scene: [GameScene],
                };

                const game = new Phaser.Game(config);

                // posso gestire piu scene, schermata loader switch scena, start

                console.log(game);
            });

            return {
                canvasRef,
                spin
            };
        },
    };
</script>

<style scoped>
    #slot-machine {
        width: 100%;
        height: 100dvh;
        position: relative;
        overflow-y: hidden;
        background-image: url("@/assets/projects/slotmachine/image/main/back.png");
        background-repeat: no-repeat;
        background-position: right bottom;
        background-size: cover;
    }
    canvas {
        width: 100%;
        height: 100%;
    }
    #play-btn {
        position: absolute;
        bottom: 50px;
        left: 50px;
        height: 50px;
        aspect-ratio: 1 / 1;
        font-size: 25px;
        background-color: rgba(255, 255, 255, 0.5);
        border-radius: 50%;
        cursor: pointer;
        text-align: center;
        line-height: 50px;
    }
</style>
