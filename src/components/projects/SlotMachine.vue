<template>
    <div id="slot-machine">
        <canvas ref="canvasRef"></canvas>
        <i id="play-btn" :class="['fas fa-play', { 'disabled': isGamePlaying }]" @click="!isGamePlaying ? spin() : undefined"></i>
    </div>
</template>

<script>
    import { ref, onMounted } from "vue";
    import Phaser from "phaser";
    import { gsap } from "gsap";
    import { getRandomNumber } from "@/assets/js/utils.js"

    import SlotBodyImage from "@/assets/projects/slotmachine/image/main/reel.png";
    import SlotCanopyImage from "@/assets/projects/slotmachine/image/main/canopy.png";
    import SlotLogoImage from "@/assets/projects/slotmachine/image/main/logo.png";

    import CharacterMainPng from "@/assets/projects/slotmachine/image/sprite/character-main_spritesheet.png";
    import CharacterMainJson from "@/assets/projects/slotmachine/image/sprite/character-main_spritesheet.json";
    import CharacterDrinkPng from "@/assets/projects/slotmachine/image/sprite/character-drink_spritesheet.png";
    import CharacterDrinkJson from "@/assets/projects/slotmachine/image/sprite/character-drink_spritesheet.json";

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
            const REEL_X_SLOT = 5;
            const REEL_LENGTH = 8;
            const SYMBOL_X_REEL = 3;

            const SYMBOLS = ['apple', 'cherry', 'coconut', 'grapefruit', 'lemon', 'watermelon'];
            //const JOLLY = 'splash';
            const MEGA_WIN = 'fruitcocktail';
            let randomWinSymbol = null;

            const REEL_1_MAP = ['lemon', 'coconut', 'watermelon', 'cherry', 'fruitcocktail', 'grapefruit', 'apple', 'splash'];
            const REEL_2_MAP = ['apple', 'cherry', 'coconut', 'fruitcocktail', 'grapefruit', 'lemon', 'splash', 'watermelon'];
            const REEL_3_MAP = ['fruitcocktail', 'grapefruit', 'cherry', 'coconut', 'watermelon', 'splash', 'apple', 'lemon'];
            const REEL_4_MAP = ['watermelon', 'splash', 'lemon', 'grapefruit', 'fruitcocktail', 'coconut', 'cherry', 'apple'];
            const REEL_5_MAP = ['splash', 'apple', 'grapefruit', 'fruitcocktail', 'cherry', 'watermelon', 'coconut', 'lemon'];

            const reels = {
                reel1: {},
                reel2: {},
                reel3: {},
                reel4: {},
                reel5: {}
            }

            let reel1Animation;
            let reel2Animation;
            let reel3Animation;
            let reel4Animation;
            let reel5Animation;

            const isGamePlaying = ref(false);



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
                    index -= 2; // end gap => show selected index on middle row
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

            const animateOnComplete = () => {
                isGamePlaying.value = false;

                if (!randomWinSymbol) return;

                for (let i = 1; i <= REEL_X_SLOT; i++) {
                    reels[`reel${i}`][`${randomWinSymbol}Sheet`].anims.play(`reel${i}-${randomWinSymbol}_animation`);
                }
            }

            const spin = () => {
                isGamePlaying.value = true;

                if (randomWinSymbol) {
                    for (let i = 1; i <= REEL_X_SLOT; i++) {
                        reels[`reel${i}`][`${randomWinSymbol}Sheet`].anims.stop();
                        reels[`reel${i}`][`${randomWinSymbol}Sheet`].setFrame(`${randomWinSymbol}-animation_30.png`);
                    }
                    randomWinSymbol = null;
                }

                let indexReels = {
                    indexReel1: null,
                    indexReel2: null,
                    indexReel3: null,
                    indexReel4: null,
                    indexReel5: null
                }
                let conditions = ['lose',/* 'fake-win',*/ 'win', 'mega-win'];
                // conditions multiplier

                const getRandomWinMap = ({ indexReel1, indexReel2, indexReel3, indexReel4, indexReel5 }) => {
                    // PAY TABLE => Index reel is always in the middle row before win map
                    const maps = [
                        {
                            indexReel1: indexReel1 - 1,
                            indexReel2: indexReel2 - 1,
                            indexReel3: indexReel3,
                            indexReel4: indexReel4 - 1,
                            indexReel5: indexReel5 - 1
                        },
                        {
                            indexReel1: indexReel1 + 1,
                            indexReel2: indexReel2 + 1,
                            indexReel3: indexReel3,
                            indexReel4: indexReel4 + 1,
                            indexReel5: indexReel5 + 1
                        },
                        {
                            indexReel1: indexReel1,
                            indexReel2: indexReel2 - 1,
                            indexReel3: indexReel3 - 1,
                            indexReel4: indexReel4 - 1,
                            indexReel5: indexReel5
                        },
                        {
                            indexReel1: indexReel1,
                            indexReel2: indexReel2 + 1,
                            indexReel3: indexReel3 + 1,
                            indexReel4: indexReel4 + 1,
                            indexReel5: indexReel5
                        },
                        {
                            indexReel1: indexReel1 - 1,
                            indexReel2: indexReel2 - 1,
                            indexReel3: indexReel3 - 1,
                            indexReel4: indexReel4 - 1,
                            indexReel5: indexReel5 - 1
                        },
                        {
                            indexReel1: indexReel1,
                            indexReel2: indexReel2,
                            indexReel3: indexReel3,
                            indexReel4: indexReel4,
                            indexReel5: indexReel5
                        },
                        {
                            indexReel1: indexReel1 + 1,
                            indexReel2: indexReel2 + 1,
                            indexReel3: indexReel3 + 1,
                            indexReel4: indexReel4 + 1,
                            indexReel5: indexReel5 + 1
                        },
                        {
                            indexReel1: indexReel1 - 1,
                            indexReel2: indexReel2,
                            indexReel3: indexReel3 + 1,
                            indexReel4: indexReel4,
                            indexReel5: indexReel5 - 1
                        },
                        {
                            indexReel1: indexReel1 + 1,
                            indexReel2: indexReel2,
                            indexReel3: indexReel3 - 1,
                            indexReel4: indexReel4,
                            indexReel5: indexReel5 + 1
                        }
                    ];

                    const random = getRandomNumber(0, maps.length - 1);
                    return maps[random];
                }

                const selectedCondition = conditions[getRandomNumber(0, conditions.length - 1)];

                switch (selectedCondition) {
                    case 'lose':
                        const randomNumber1 = getRandomNumber(0, SYMBOLS.length - 1);
                        let randomNumber2 = getRandomNumber(0, SYMBOLS.length - 1);
                        while (REEL_1_MAP[randomNumber1] === REEL_2_MAP[randomNumber2]) {
                            randomNumber2 = getRandomNumber(0, SYMBOLS.length - 1);
                        }
                        const randomNumber3 = getRandomNumber(0, SYMBOLS.length - 1);
                        let randomNumber4 = getRandomNumber(0, SYMBOLS.length - 1);
                        while (REEL_3_MAP[randomNumber3] === REEL_4_MAP[randomNumber4]) {
                            randomNumber4 = getRandomNumber(0, SYMBOLS.length - 1);
                        }
                        const randomNumber5 = getRandomNumber(0, SYMBOLS.length - 1);

                        indexReels.indexReel1 = randomNumber1;
                        indexReels.indexReel2 = randomNumber2;
                        indexReels.indexReel3 = randomNumber3;
                        indexReels.indexReel4 = randomNumber4;
                        indexReels.indexReel5 = randomNumber5;
                        break
                    case 'win':
                    case 'mega-win':
                        randomWinSymbol = selectedCondition === 'win' ? SYMBOLS[getRandomNumber(0, SYMBOLS.length - 1)] : MEGA_WIN;

                        indexReels.indexReel1 = REEL_1_MAP.indexOf(randomWinSymbol);
                        indexReels.indexReel2 = REEL_2_MAP.indexOf(randomWinSymbol);
                        indexReels.indexReel3 = REEL_3_MAP.indexOf(randomWinSymbol);
                        indexReels.indexReel4 = REEL_4_MAP.indexOf(randomWinSymbol);
                        indexReels.indexReel5 = REEL_5_MAP.indexOf(randomWinSymbol);

                        indexReels = Object.assign(getRandomWinMap(indexReels));
                }

                const animRevolutions = 20; // Increase this value for faster animations
                const animDuration = 5;
                let newAnimDuration = getRandomNumber(40, 60);
                newAnimDuration = newAnimDuration / 10;
                const newAnimRevolutions = Math.floor((animRevolutions / animDuration) * newAnimDuration);

                reel1Animation.toIndex(indexReels.indexReel1, { duration: parseFloat((newAnimDuration + 0.10).toFixed(1)), revolutions: newAnimRevolutions, ease: "power2.inOut" });
                reel2Animation.toIndex(indexReels.indexReel2, { duration: parseFloat((newAnimDuration + 0.25).toFixed(1)), revolutions: newAnimRevolutions, ease: "power2.inOut" });
                reel3Animation.toIndex(indexReels.indexReel3, { duration: parseFloat((newAnimDuration + 0.42).toFixed(1)), revolutions: newAnimRevolutions, ease: "power2.inOut" });
                reel4Animation.toIndex(indexReels.indexReel4, { duration: parseFloat((newAnimDuration + 0.63).toFixed(1)), revolutions: newAnimRevolutions, ease: "power2.inOut" });
                reel5Animation.toIndex(indexReels.indexReel5, { duration: parseFloat((newAnimDuration + 0.91).toFixed(1)), revolutions: newAnimRevolutions, ease: "power2.inOut", onComplete: () => animateOnComplete() });
            }



            onMounted(() => {
                class GameScene extends Phaser.Scene {
                    constructor() {
                        super({ key: 'gameScene' });

                        this.slotBody;
                        this.slotCanopy;
                        this.slotLogo;

                        this.characterMain;
                        this.characterDrink;
                    }

                    preload() {
                        this.load.image('slot_body', SlotBodyImage);
                        this.load.image('slot_canopy', SlotCanopyImage);
                        this.load.image('slot_logo', SlotLogoImage);

                        this.load.atlas('character-main_sprite', CharacterMainPng, CharacterMainJson);
                        this.load.atlas('character-drink_sprite', CharacterDrinkPng, CharacterDrinkJson);

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
                        this.slotBody = this.add.image(0, 0, 'slot_body').setOrigin(0, 0);

                        const ratio = this.slotBody.height / this.slotBody.width;
                        this.slotBody.displayWidth =
                            (canvasRef.value.offsetWidth * 50) / 100;
                        this.slotBody.displayHeight =
                            this.slotBody.displayWidth * ratio * 0.955;

                        this.slotBody.setPosition(
                            canvasRef.value.offsetWidth / 2 -
                                this.slotBody.displayWidth / 2,
                            canvasRef.value.offsetHeight / 2 -
                                this.slotBody.displayHeight / 2
                        );

                        this.characterDrink = this.add.sprite(0, 0, 'character-main_sprite', 'character-main-animation_01.png').setOrigin(0, 0);
                        this.characterDrink.visible = false;
                        this.characterDrink.setScale(1.25 * this.slotBody.scaleX, 1.25 * this.slotBody.scaleX);
                        this.characterDrink.setPosition(canvasRef.value.offsetWidth - this.characterDrink.displayWidth - (40 * this.slotBody.scaleX), canvasRef.value.offsetHeight - this.characterDrink.displayHeight - (105 * this.slotBody.scaleX));
                        this.anims.create({
                            key: 'character-drink_animation',
                            frames: this.anims.generateFrameNames('character-drink_sprite', { start: 1, end: 40, zeroPad: 2, prefix: 'character-drink-animation_', suffix: '.png' }),
                            frameRate: ANIMATION_FPS,
                            repeat: -1
                        });

                        this.characterMain = this.add.sprite(0, 0, 'character-main_sprite', 'character-main-animation_01.png').setOrigin(0, 0);
                        this.characterMain.setScale(1.25 * this.slotBody.scaleX, 1.25 * this.slotBody.scaleX);
                        this.characterMain.setPosition(canvasRef.value.offsetWidth - this.characterMain.displayWidth - (75 * this.slotBody.scaleX), canvasRef.value.offsetHeight - this.characterMain.displayHeight - (45 * this.slotBody.scaleX));
                        this.anims.create({
                            key: 'character-main_animation',
                            frames: this.anims.generateFrameNames('character-main_sprite', { start: 1, end: 80, zeroPad: 2, prefix: 'character-main-animation_', suffix: '.png' }),
                            frameRate: ANIMATION_FPS,
                            repeat: -1
                        });
                        this.characterMain.anims.play('character-main_animation');

                        this.characterMain.setInteractive();
                        this.characterMain.on('pointerdown', () => {
                            this.characterMain.visible = false;
                            this.characterMain.anims.pause();
                            this.characterDrink.visible = true;
                            this.characterDrink.anims.play('character-drink_animation');
                        });
                        this.characterDrink.setInteractive();
                        this.characterDrink.on('pointerdown', () => {
                            this.characterDrink.visible = false;
                            this.characterDrink.anims.pause();
                            this.characterMain.visible = true;
                            this.characterMain.anims.play('character-main_animation');
                        });



                        const generateReel = (id, reelMap, xGap) => {
                            const reel = [];
                            const elementsHeightWrap = [];
                            const maskDimension = {
                                width: 322 * this.slotBody.scaleX,
                                height: 322 * this.slotBody.scaleX * SYMBOL_X_REEL
                            }
                            const mask = this.add.graphics();

                            //mask.fillStyle(0xff0000, 1); // DEBUG TOOL

                            mask.fillRect(0, 0, maskDimension.width, maskDimension.height);
                            mask.setPosition(this.slotBody.x + (xGap * this.slotBody.scaleX), this.slotBody.y + (96 * this.slotBody.scaleX));

                            for (let i = 0; i < reelMap.length; i++) {
                                reels[`reel${id}`][`${reelMap[i]}Sheet`] = this.add.sprite(mask.x - (67 * this.slotBody.scaleX), 0, `${reelMap[i]}_sprite`, `${reelMap[i]}-animation_30.png`).setOrigin(0, 0);
                                reels[`reel${id}`][`${reelMap[i]}Sheet`].setScale(0.98 * this.slotBody.scaleX, 0.98 * this.slotBody.scaleX);
                                reels[`reel${id}`][`${reelMap[i]}Sheet`].y = mask.y + (maskDimension.width * i) - (87 * this.slotBody.scaleX);
                                reels[`reel${id}`][`${reelMap[i]}Sheet`].setMask(mask.createGeometryMask());

                                this.anims.create({
                                    key: `reel${id}-${reelMap[i]}_animation`,
                                    frames: this.anims.generateFrameNames(`${reelMap[i]}_sprite`, { start: 1, end: 30, zeroPad: 2, prefix: `${reelMap[i]}-animation_`, suffix: '.png' }),
                                    frameRate: ANIMATION_FPS,
                                    repeat: -1
                                });

                                reel.push(reels[`reel${id}`][`${reelMap[i]}Sheet`]);
                                elementsHeightWrap.push((67.9 * this.slotBody.scaleX) * 2);
                            }

                            // resize after sheet creation to render animation out of the reel
                            mask.scaleX = 1.5;
                            mask.x -= 75 * this.slotBody.scaleX;

                            return verticalLoop(reel, maskDimension, elementsHeightWrap, {
                                repeat: -1,
                                paused: true,
                                center: true,
                            });
                        }

                        reel1Animation = generateReel(1, REEL_1_MAP, 34);
                        reel2Animation = generateReel(2, REEL_2_MAP, 376);
                        reel3Animation = generateReel(3, REEL_3_MAP, 718);
                        reel4Animation = generateReel(4, REEL_4_MAP, 1060);
                        reel5Animation = generateReel(5, REEL_5_MAP, 1402);

                        this.slotCanopy = this.add.image(this.slotBody.x + this.slotBody.displayWidth / 2, this.slotBody.y - (140 * this.slotBody.scaleX), 'slot_canopy').setOrigin(0.5, 0);
                        this.slotCanopy.setScale(1 * this.slotBody.scaleX, 1 * this.slotBody.scaleX);
                        this.slotLogo = this.add.image(this.slotBody.x + this.slotBody.displayWidth / 2, this.slotBody.y - (190 * this.slotBody.scaleX), 'slot_logo').setOrigin(0.5, 0);
                        this.slotLogo.setScale(1 * this.slotBody.scaleX, 1 * this.slotBody.scaleX);
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
                };

                const game = new Phaser.Game(config);
                game.scene.add('gameScene', GameScene);
                game.scene.start('gameScene');
            });

            return {
                canvasRef,
                isGamePlaying,
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
    #play-btn.disabled {
        opacity: 0.8;
        cursor: auto;
    }
</style>
