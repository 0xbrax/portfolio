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

    import AppleSpritePng from "@/assets/projects/slotmachine/image/sprite/apple_spritesheet.png";
    import AppleSpriteJson from "@/assets/projects/slotmachine/image/sprite/apple_spritesheet.json";
    import CoconutSpritePng from "@/assets/projects/slotmachine/image/sprite/coconut_spritesheet.png";
    import CoconutSpriteJson from "@/assets/projects/slotmachine/image/sprite/coconut_spritesheet.json";
    import FruitcocktailSpritePng from "@/assets/projects/slotmachine/image/sprite/fruitcocktail_spritesheet.png";
    import FruitcocktailSpriteJson from "@/assets/projects/slotmachine/image/sprite/fruitcocktail_spritesheet.json";
    import GrapefruitSpritePng from "@/assets/projects/slotmachine/image/sprite/grapefruit_spritesheet.png";
    import GrapefruitSpriteJson from "@/assets/projects/slotmachine/image/sprite/grapefruit_spritesheet.json";
    import LemonSpritePng from "@/assets/projects/slotmachine/image/sprite/lemon_spritesheet.png";
    import LemonSpriteJson from "@/assets/projects/slotmachine/image/sprite/lemon_spritesheet.json";
    import PearSpritePng from "@/assets/projects/slotmachine/image/sprite/pear_spritesheet.png";
    import PearSpriteJson from "@/assets/projects/slotmachine/image/sprite/pear_spritesheet.json";
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
            const REEL_LENGTH = 7;

            const REEL_1_MAP = [1, 2, 3, 4, 5, 6, 7];
            const REEL_2_MAP = [4, 6, 1, 3, 5, 7, 2];
            const REEL_3_MAP = [1, 2, 7, 6, 3, 5, 4];
            const REEL_4_MAP = [2, 4, 6, 1, 3, 5, 7];
            const REEL_5_MAP = [6, 3, 2, 7, 5, 1, 4];

            const IMG_GAP_X = 2;
            const IMG_GAP_Y = 1;

            let reel1Animation;
            let reel2Animation;
            let reel3Animation;
            let reel4Animation;
            let reel5Animation;



            const verticalLoop = (items, image, config) => {
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
                    startY = items[REEL_LENGTH - 1].y + items[0].displayHeight,
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
                    totalHeight = items[0].displayHeight * REEL_LENGTH,
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
                            distanceToStart = startY - curY - (items[0].displayHeight * 2);
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
                    index -= 2; // gap
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

                /*
                import TestImage1 from "@/assets/projects/slotmachine/image/test/apple.png";
                import TestImage2 from "@/assets/projects/slotmachine/image/test/arbuz.png";
                import TestImage3 from "@/assets/projects/slotmachine/image/test/cherry.png";
                import TestImage4 from "@/assets/projects/slotmachine/image/test/cocktail.png";
                import TestImage5 from "@/assets/projects/slotmachine/image/test/lemon.png";
                import TestImage6 from "@/assets/projects/slotmachine/image/test/nut.png";
                import TestImage7 from "@/assets/projects/slotmachine/image/test/straw.png";*/
                /*
                const REEL_1_MAP = [1, 2, 3, 4, 5, 6, 7];
                const REEL_2_MAP = [4, 6, 1, 3, 5, 7, 2];
                const REEL_3_MAP = [1, 2, 7, 6, 3, 5, 4];
                const REEL_4_MAP = [2, 4, 6, 1, 3, 5, 7];
                const REEL_5_MAP = [6, 3, 2, 7, 5, 1, 4];*/


                //const randomIndex1 = getRandomNumber(0, REEL_LENGTH - 1);
                //console.log('RANDOM 1', randomIndex1, `REEL 1 image: ${randomIndex1 + 1}`)



                reel1Animation.toIndex(indexReels.indexReel1, { duration: 5.10, revolutions: 20, ease: "power2.inOut" });
                reel2Animation.toIndex(indexReels.indexReel2, { duration: 5.25, revolutions: 20, ease: "power2.inOut" });
                reel3Animation.toIndex(indexReels.indexReel3, { duration: 5.42, revolutions: 20, ease: "power2.inOut" });
                reel4Animation.toIndex(indexReels.indexReel4, { duration: 5.63, revolutions: 20, ease: "power2.inOut" });
                reel5Animation.toIndex(indexReels.indexReel5, { duration: 5.91, revolutions: 20, ease: "power2.inOut" });
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

                        this.appleSheet;
                        this.coconutSheet;
                        this.fruitcocktailSheet;
                        this.grapefruitSheet;
                        this.lemonSheet;
                        this.pearSheet;
                        this.splashSheet;
                        this.watermelonSheet;
                    }

                    preload() {
                        this.load.image("slotBody", SlotBodyImage);
                        this.load.image("test", TestImage);

                        this.load.image("test1", TestImage1);
                        this.load.image("test2", TestImage2);
                        this.load.image("test3", TestImage3);
                        this.load.image("test4", TestImage4);
                        this.load.image("test5", TestImage5);
                        this.load.image("test6", TestImage6);
                        this.load.image("test7", TestImage7);

                        this.load.atlas('apple_sprite', AppleSpritePng, AppleSpriteJson);
                        this.load.atlas('coconut_sprite', CoconutSpritePng, CoconutSpriteJson);
                        this.load.atlas('fruitcocktail_sprite', FruitcocktailSpritePng, FruitcocktailSpriteJson);
                        this.load.atlas('grapefruit_sprite', GrapefruitSpritePng, GrapefruitSpriteJson);
                        this.load.atlas('lemon_sprite', LemonSpritePng, LemonSpriteJson);
                        this.load.atlas('pear_sprite', PearSpritePng, PearSpriteJson);
                        this.load.atlas('splash_sprite', SplashSpritePng, SplashSpriteJson);
                        this.load.atlas('watermelon_sprite', WatermelonSpritePng, WatermelonSpriteJson);
                    }

                    create() {
                        this.anims.create({
                            key: 'apple_animation',
                            frames: this.anims.generateFrameNames('apple_sprite', { start: 1, end: 30, zeroPad: 2, prefix: 'apple-animation_', suffix: '.png' }), // Specifica i frame da utilizzare
                            frameRate: ANIMATION_FPS,
                            repeat: -1
                        });
                        //this.appleSheet = this.add.sprite(400, 300, 'apple_sprite', 'apple-animation_01.png');



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
                            const IMG_DIMENSION = 340;
                            const reel = [];
                            const mask = this.add.graphics();

                            mask.fillStyle(0xff0000, 1); // DEBUG

                            mask.fillRect(0, 0, 322 * this.image.scaleX, 322 * 3 * this.image.scaleX);
                            mask.setPosition(this.image.x + (xGap * this.image.scaleX), this.image.y + (96 * this.image.scaleX));

                            for (let i = 0; i < 7; i++) {
                                const img = this.add.image(
                                    mask.x - IMG_GAP_X,
                                    mask.y + (IMG_DIMENSION * this.image.scaleX * i) - IMG_GAP_Y,
                                    `test${reelMap[i]}`
                                ).setOrigin(0, 0);

                                img.displayWidth = IMG_DIMENSION * this.image.scaleX;
                                img.displayHeight = IMG_DIMENSION * this.image.scaleX;
                                img.setMask(
                                    mask.createGeometryMask()
                                );

                                reel.push(img);
                            }



                            //let iter = 1; // reel order 0 to 7 (8)

                            this.appleSheet = this.add.sprite(mask.x - (82 * this.image.scaleX), 0, 'apple_sprite', 'apple-animation_01.png').setOrigin(0, 0);
                            this.appleSheet.setScale(0.98 * this.image.scaleX, 0.98 * this.image.scaleX);
                            this.appleSheet.y = mask.y + (322 * this.image.scaleX * 0) - (86 * this.image.scaleX);
                            this.appleSheet.setMask(mask.createGeometryMask());
                            //this.appleSheet.play('apple_animation');

                            this.coconutSheet = this.add.sprite(mask.x - (86 * this.image.scaleX), 0, 'coconut_sprite', 'coconut-animation_30.png').setOrigin(0, 0);
                            this.coconutSheet.setScale(0.96 * this.image.scaleX, 0.96 * this.image.scaleX);
                            this.coconutSheet.y = mask.y + (322 * this.image.scaleX * 1) - (76 * this.image.scaleX);
                            //this.coconutSheet.setMask(mask.createGeometryMask());

                            this.fruitcocktailSheet = this.add.sprite(mask.x - (72 * this.image.scaleX), 0, 'fruitcocktail_sprite', 'fruitcocktail-animation_01.png').setOrigin(0, 0);
                            this.fruitcocktailSheet.setScale(0.98 * this.image.scaleX, 0.98 * this.image.scaleX);
                            this.fruitcocktailSheet.y = mask.y + (322 * this.image.scaleX * 2) - (74 * this.image.scaleX);
                            //this.fruitcocktailSheet.setMask(mask.createGeometryMask());

                            this.fruitcocktailSheet = this.add.sprite(mask.x - (72 * this.image.scaleX), 0, 'fruitcocktail_sprite', 'fruitcocktail-animation_01.png').setOrigin(0, 0);
                            this.fruitcocktailSheet.setScale(0.98 * this.image.scaleX, 0.98 * this.image.scaleX);
                            this.fruitcocktailSheet.y = mask.y + (322 * this.image.scaleX * 3) - (74 * this.image.scaleX);
                            //this.fruitcocktailSheet.setMask(mask.createGeometryMask());

                            this.grapefruitSheet = this.add.sprite(mask.x - (68 * this.image.scaleX), 0, 'grapefruit_sprite', 'grapefruit-animation_01.png').setOrigin(0, 0);
                            this.grapefruitSheet.setScale(0.98 * this.image.scaleX, 0.98 * this.image.scaleX);
                            this.grapefruitSheet.y = mask.y + (322 * this.image.scaleX * 2) - (64 * this.image.scaleX);
                            //this.grapefruitSheet.setMask(mask.createGeometryMask());

                            this.lemonSheet = this.add.sprite(mask.x - (70 * this.image.scaleX), 0, 'lemon_sprite', 'lemon-animation_01.png').setOrigin(0, 0);
                            this.lemonSheet.setScale(0.98 * this.image.scaleX, 0.98 * this.image.scaleX);
                            this.lemonSheet.y = mask.y + (322 * this.image.scaleX * 0) - (74 * this.image.scaleX);
                            //this.lemonSheet.setMask(mask.createGeometryMask());

                            this.pearSheet = this.add.sprite(mask.x - (80 * this.image.scaleX), 0, 'pear_sprite', 'pear-animation_30.png').setOrigin(0, 0);
                            this.pearSheet.setScale(1.02 * this.image.scaleX, 1.02 * this.image.scaleX);
                            this.pearSheet.y = mask.y + (322 * this.image.scaleX * 0) - (76 * this.image.scaleX);
                            //this.pearSheet.setMask(mask.createGeometryMask());

                            this.splashSheet = this.add.sprite(mask.x - (124 * this.image.scaleX), 0, 'splash_sprite', 'splash-animation_01.png').setOrigin(0, 0);
                            this.splashSheet.setScale(1 * this.image.scaleX, 1 * this.image.scaleX);
                            this.splashSheet.y = mask.y + (322 * this.image.scaleX * 2) - (118 * this.image.scaleX);
                            //this.splashSheet.setMask(mask.createGeometryMask());

                            this.watermelonSheet = this.add.sprite(mask.x - (72 * this.image.scaleX), 0, 'watermelon_sprite', 'watermelon-animation_01.png').setOrigin(0, 0);
                            this.watermelonSheet.setScale(0.98 * this.image.scaleX, 0.98 * this.image.scaleX);
                            this.watermelonSheet.y = mask.y + (322 * this.image.scaleX * 0) - (72 * this.image.scaleX);
                            //this.watermelonSheet.setMask(mask.createGeometryMask());





                            return verticalLoop(reel, this.image, {
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

                // gestire piu scene, schermata loader switch scena, start ?
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
