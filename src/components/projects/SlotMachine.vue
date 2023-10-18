<template>
    <div id="slot-machine">
        <canvas ref="canvasRef"></canvas>
    </div>
</template>

<script>
    import { ref, onMounted } from "vue";
    import Phaser from "phaser";
    import { gsap } from "gsap";

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

            const ITEM_RECT = {
                width: 138,
                height: 138,
                top: 127,
                bottom: 127 + 138,
            };
            const CONTAINER_RECT = {
                width: ITEM_RECT.width,
                height: ITEM_RECT.height * 7,
                top: 127,
                bottom: 127 + ITEM_RECT.height * 7,
            };

            function verticalLoop(items, config) {
                console.log(items)

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
                    startY = items[0].y,
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
                    pixelsPerSecond = (config.speed || 1) * 100,
                    snap =
                        config.snap === false
                            ? (v) => v
                            : gsap.utils.snap(config.snap || 1), // some browsers shift by a pixel to accommodate flex layouts, so for example if width is 20% the first element's width might be 242px, and the next 243px, alternating back and forth. So we snap to 5 percentage points to make things look more natural
                    timeOffset = 0,
                    container = CONTAINER_RECT,
                    totalHeight = container.height,
                    populateHeights = () => {
                        items.forEach((el, i) => {
                            heights[i] = el.height;
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

                            console.log('QUI', [...items])

                            item = items[i];
                            curY = item.y;
                            distanceToStart =
                                item.y + curY - startY;
                            distanceToLoop =
                                distanceToStart +
                                heights[i];


                            console.log(distanceToStart, distanceToLoop)

                            console.log('SNAP 2', snap(
                                            ((curY -
                                                distanceToLoop +
                                                totalHeight) /
                                                heights[i]) *
                                                100
                                        ))

                            console.log('SNAP 1', snap(
                                        ((curY - distanceToLoop) / heights[i]) *
                                            100
                                    ))

                            
                            tl.to(
                                item,
                                {
                                    y: snap(
                                        ((curY - distanceToLoop) / heights[i]) *
                                            100
                                    ),
                                    duration: distanceToLoop / pixelsPerSecond,
                                },
                                0
                            )
                                .fromTo(
                                    item,
                                    {
                                        y: snap(
                                            ((curY -
                                                distanceToLoop +
                                                totalHeight) /
                                                heights[i]) *
                                                100
                                        ),
                                    },
                                    {
                                        y: item.y,
                                        duration:
                                            (curY -
                                                distanceToLoop +
                                                totalHeight -
                                                curY) /
                                            pixelsPerSecond,
                                        immediateRender: false,
                                    },
                                    distanceToLoop / pixelsPerSecond
                                )
                                .add(
                                    "label" + i,
                                    distanceToStart / pixelsPerSecond
                                );
                            times[i] = distanceToStart / pixelsPerSecond;

                            console.log('LOG', item)
                        }
                        timeWrap = gsap.utils.wrap(0, tl.duration());
                    },
                    proxy;
                //gsap.set(items, { y: 0 });
                populateHeights();
                populateTimeline();
                populateOffsets();
                function toIndex(index, vars) {
                    vars = clone(vars);
                    Math.abs(index - curIndex) > length / 2 &&
                        (index += index > curIndex ? -length : length); // always go in the shortest direction
                    let newIndex = gsap.utils.wrap(0, length, index),
                        time = times[newIndex];
                    if (time > tl.time() !== index > curIndex) {
                        // if we're wrapping the timeline's playhead, make the proper adjustments
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
                    gsap.killTweensOf(proxy);
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



            const spin = (wheel) => {
                // pick a random index from the Array of elements in this wheel
                let randomIndex = gsap.utils.random(0, wheel.elements.length, 1);
                // now animate to that index, adding an extra 2 full revolutions. 
                wheel.toIndex(randomIndex, {duration: 3, revolutions: 2, ease: "power2.inOut"});
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
                        this.tedt7;

                        this.totalReelHeight = 138 * 7;
                        this.animation = {};
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

                        const mask = this.add.graphics();
                        mask.fillStyle(0xff0000, 1);
                        mask.fillRect(393, 127, 138, 437);

                        const reel1 = [];

                        for (let i = 0; i < 7; i++) {
                            this[`test${i + 1}`] = this.add.image(
                                393 + 138 / 2,
                                127 + 138 * i + 138 / 2,
                                `test${i + 1}`
                            );

                            this[`test${i + 1}`].displayWidth = 138;
                            this[`test${i + 1}`].displayHeight = 138;
                            this[`test${i + 1}`].setMask(
                                mask.createGeometryMask()
                            );

                            reel1.push(this[`test${i + 1}`]);
                        }

                        console.log(reel1)


                        const reel1Animation = verticalLoop(reel1, {
                            repeat: -1,
                            paused: true,
                            center: true,
                        });

                        setTimeout(() => {
                            spin(reel1Animation)
                        }, 1000);
                    }

                    update() {
                        /*for (let i = 0; i < 7; i++) {
                            //this[`test${i + 1}`].setY(this[`test${i + 1}`].y += 0.5);
                            if (this[`test${i + 1}`].y > this.totalReelHeight + (138 / 2)) {
                                this[`test${i + 1}`].setY((127 + (138 / 2)) - 138);
                            }
                        }*/
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
</style>
