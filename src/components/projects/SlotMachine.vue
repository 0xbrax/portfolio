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

    import SlotBodyImage from "@/assets/projects/slotmachine/image/main/reel.png";
    import TestImage from "@/assets/projects/slotmachine/image/test/spritesheet.png";

    import AppleSpritePng from "@/assets/projects/slotmachine/image/sprite/apple_spritesheet.png";
    import AppleSpriteJson from "@/assets/projects/slotmachine/image/sprite/apple_spritesheet.json";
    import CherrySpritePng from "@/assets/projects/slotmachine/image/sprite/cherry_spritesheet.png";
    import CherrySpriteJson from "@/assets/projects/slotmachine/image/sprite/cherry_spritesheet.json";
    import CoconutSpritePng from "@/assets/projects/slotmachine/image/sprite/coconut_spritesheet.png";
    import CoconutSpriteJson from "@/assets/projects/slotmachine/image/sprite/coconut_spritesheet.json";
    import FruitcocktailSpritePng from "@/assets/projects/slotmachine/image/sprite/fruitcocktail_spritesheet.png";
    import FruitcocktailSpriteJson from "@/assets/projects/slotmachine/image/sprite/fruitcocktail_spritesheet.json";
    import GrapefruitSpritePng from "@/assets/projects/slotmachine/image/sprite/grapefruit_spritesheet.png";
    import GrapefruitSpriteJson from "@/assets/projects/slotmachine/image/sprite/grapefruit_spritesheet.json";
    import LemonSpritePng from "@/assets/projects/slotmachine/image/sprite/lemon_spritesheet.png";
    import LemonSpriteJson from "@/assets/projects/slotmachine/image/sprite/lemon_spritesheet.json";
    import SplashSpritePng from "@/assets/projects/slotmachine/image/sprite/splash_spritesheet.png";
    import SplashSpriteJson from "@/assets/projects/slotmachine/image/sprite/splash_spritesheet.json";
    import WatermelonSpritePng from "@/assets/projects/slotmachine/image/sprite/watermelon_spritesheet.png";
    import WatermelonSpriteJson from "@/assets/projects/slotmachine/image/sprite/watermelon_spritesheet.json";

    export default {
        name: "SlotMachine",

        setup() {
            // RandomNumberGenerator
            // ReturnToPlayer

            const canvasRef = ref(null);
            const ANIMATION_FPS = 24;
            const REEL_LENGTH = 8;
            const SYMBOL_X_REEL = 3;

            const REEL_1_MAP = ['apple', 'coconut', 'fruitcocktail', 'grapefruit', 'lemon', 'cherry', 'splash', 'watermelon'];
            const REEL_2_MAP = ['cherry', 'splash', 'watermelon', 'apple', 'coconut', 'fruitcocktail', 'grapefruit', 'lemon'];
            const REEL_3_MAP = ['fruitcocktail', 'grapefruit', 'splash', 'watermelon', 'lemon', 'apple', 'coconut', 'cherry'];
            const REEL_4_MAP = ['apple', 'cherry', 'splash', 'fruitcocktail', 'grapefruit', 'lemon', 'coconut', 'watermelon'];
            const REEL_5_MAP = ['grapefruit', 'coconut', 'lemon', 'apple', 'watermelon', 'cherry', 'splash', 'fruitcocktail'];

            let reel1Animation;
            let reel2Animation;
            let reel3Animation;
            let reel4Animation;
            let reel5Animation;



            const verticalLoop = (items, reelContainer, elementsHeightWrap, config) => {
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
                    startY = items[REEL_LENGTH - 1].y,
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
                    container = reelContainer,
                    totalHeight = 0,
                    populateHeights = () => {
                        items.forEach((el, i) => {
                            heights[i] = el.displayHeight - elementsHeightWrap[i];
                            totalHeight += heights[i];
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
                            distanceToStart = startY - curY;
                            distanceToLoop = distanceToStart;
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
                    index -= 2; // start gap
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
                const conditions = [
                    {
                        mode: 'lose'
                    },
                    {
                        mode: 'fake-win'
                    },
                    {
                        mode: 'win'
                    },
                    {
                        mode: 'mega-win'
                    }
                ];

                //const randomCondition = conditions[getRandomNumber(0, conditions.length - 1)];
                const selectedCondition = conditions[3];
                const indexReels = {
                    indexReel1: null,
                    indexReel2: null,
                    indexReel3: null,
                    indexReel4: null,
                    indexReel5: null
                }

                switch (selectedCondition.mode) {
                    case 'lose':
                        break
                    case 'fake-win':
                        break
                    case 'win':
                        break
                    case 'mega-win':
                        const reelRows = [
                            {
                                row1: {
                                    reel1: 3,
                                    reel2: 0,
                                    reel3: 6,
                                    reel4: 1,
                                    reel5: 6
                                }
                            },
                            {
                                row2: {
                                    reel1: 2,
                                    reel2: 6,
                                    reel3: 5,
                                    reel4: 0,
                                    reel5: 5
                                }
                            },
                            {
                                row3: {
                                    reel1: 1,
                                    reel2: 5,
                                    reel3: 4,
                                    reel4: 6,
                                    reel5: 4
                                }
                            }
                        ];
                        const randomRow = getRandomNumber(0, reelRows.length - 1);
                        const selectedRow = reelRows[randomRow];

                        for (let i = 1; i < REEL_LENGTH; i++) {
                            indexReels[`indexReel${i}`] = selectedRow[`row${randomRow + 1}`][`reel${i}`];
                        }
                }

                //const randomIndex1 = getRandomNumber(0, REEL_LENGTH - 1);
                //console.log('RANDOM 1', randomIndex1, `REEL 1 image: ${randomIndex1 + 1}`)



                reel1Animation.toIndex(0, { duration: 5.10, revolutions: 2, ease: "power2.inOut" });
                reel2Animation.toIndex(1, { duration: 5.25, revolutions: 2, ease: "power2.inOut" });
                reel3Animation.toIndex(2, { duration: 5.42, revolutions: 2, ease: "power2.inOut" });
                reel4Animation.toIndex(3, { duration: 5.63, revolutions: 2, ease: "power2.inOut" });
                reel5Animation.toIndex(4, { duration: 5.91, revolutions: 2, ease: "power2.inOut", onComplete: () => console.log('Complete, CHECK animation') });
            }



            onMounted(() => {
                class GameScene extends Phaser.Scene {
                    constructor() {
                        super({ key: "gameScene" });

                        this.image;
                        this.test;

                        this.appleSheet;
                        this.cherrySheet;
                        this.coconutSheet;
                        this.fruitcocktailSheet;
                        this.grapefruitSheet;
                        this.lemonSheet;
                        this.splashSheet;
                        this.watermelonSheet;
                    }

                    preload() {
                        this.load.image("slotBody", SlotBodyImage);
                        this.load.image("test", TestImage);

                        this.load.atlas('apple_sprite', AppleSpritePng, AppleSpriteJson);
                        this.load.atlas('cherry_sprite', CherrySpritePng, CherrySpriteJson);
                        this.load.atlas('coconut_sprite', CoconutSpritePng, CoconutSpriteJson);
                        this.load.atlas('fruitcocktail_sprite', FruitcocktailSpritePng, FruitcocktailSpriteJson);
                        this.load.atlas('grapefruit_sprite', GrapefruitSpritePng, GrapefruitSpriteJson);
                        this.load.atlas('lemon_sprite', LemonSpritePng, LemonSpriteJson);
                        this.load.atlas('splash_sprite', SplashSpritePng, SplashSpriteJson);
                        this.load.atlas('watermelon_sprite', WatermelonSpritePng, WatermelonSpriteJson);
                    }

                    create() {
                        this.image = this.add
                            .image(0, 0, "slotBody")
                            .setOrigin(0, 0);

                        const ratio = this.image.height / this.image.width;
                        this.image.displayWidth =
                            (canvasRef.value.offsetWidth * 50) / 100;
                        this.image.displayHeight =
                            this.image.displayWidth * ratio * 0.955;

                        this.image.setPosition(
                            canvasRef.value.offsetWidth / 2 -
                                this.image.displayWidth / 2,
                            canvasRef.value.offsetHeight / 2 -
                                this.image.displayHeight / 2
                        );

                        const generateReel = (reelMap, xGap) => {
                            const reel = [];
                            const elementsHeightWrap = [];
                            const maskDimension = {
                                width: 322 * this.image.scaleX,
                                height: 322 * this.image.scaleX * SYMBOL_X_REEL
                            }
                            const mask = this.add.graphics();

                            //mask.fillStyle(0xff0000, 1); // DEBUG

                            mask.fillRect(0, 0, maskDimension.width, maskDimension.height);
                            mask.setPosition(this.image.x + (xGap * this.image.scaleX), this.image.y + (96 * this.image.scaleX));

                            for (let i = 0; i < reelMap.length; i++) {
                                this[`${reelMap[i]}Sheet`] = this.add.sprite(mask.x - (72 * this.image.scaleX), 0, `${reelMap[i]}_sprite`, `${reelMap[i]}-animation_30.png`).setOrigin(0, 0);
                                this[`${reelMap[i]}Sheet`].setScale(1 * this.image.scaleX, 1 * this.image.scaleX);
                                this[`${reelMap[i]}Sheet`].y = mask.y + (maskDimension.width * i) - (90 * this.image.scaleX);
                                this[`${reelMap[i]}Sheet`].setMask(mask.createGeometryMask());

                                this.anims.create({
                                    key: `${reelMap[i]}_animation`,
                                    frames: this.anims.generateFrameNames(`${reelMap[i]}_sprite`, { start: 1, end: 30, zeroPad: 2, prefix: `${reelMap[i]}-animation_`, suffix: '.png' }),
                                    frameRate: ANIMATION_FPS,
                                    repeat: -1
                                });

                                this[`${reelMap[i]}Sheet`].anims.play(`${reelMap[i]}_animation`);
                                // this[`${el}Sheet`].anims.stop();
                                // this[`${el}Sheet`].anims.seek(0);

                                reel.push(this[`${reelMap[i]}Sheet`]);
                                elementsHeightWrap.push((72.4 * this.image.scaleX) * 2);
                            }

                            return verticalLoop(reel, maskDimension, elementsHeightWrap, {
                                repeat: -1,
                                paused: true,
                                center: true,
                            });
                        }

                        reel1Animation = generateReel(REEL_1_MAP, 34);
                        reel2Animation = generateReel(REEL_2_MAP, 376);
                        reel3Animation = generateReel(REEL_3_MAP, 718);
                        reel4Animation = generateReel(REEL_4_MAP, 1060);
                        reel5Animation = generateReel(REEL_5_MAP, 1402);
                    }

                    /*update() {
                        //
                    }*/
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
                    scene: [GameScene],
                };

                const game = new Phaser.Game(config);

                // multi scene handler ?
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
