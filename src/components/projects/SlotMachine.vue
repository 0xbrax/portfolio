<template>
    <div id="slot-machine">
        <canvas ref="canvasRef"></canvas>

        <!--<div v-if="isLoadingScreenActive" id="slot-machine_loader" class="d-flex column justify-ctr align-ctr">
            <img id="logo-full" src="@/assets/projects/slotmachine/image/main/logo_full.png" alt="Fruit Cocktail" />
            
            <div id="loader-btn" :class="{ 'complete pointer': isLoadingComplete }" ref="loaderBtnRef">{{ !isLoadingComplete ? 'loading' : 'enter' }}</div>

            <div id="progress-bar-container">
                <div id="progress-bar" :style="`width: ${loaderProgress}%`"></div>
            </div>
        </div>-->
    </div>
</template>

<script>
    import { ref, onMounted, watch } from "vue";
    import Phaser from "phaser";
    import { isDeviceMobile, getRandomNumber } from "@/assets/js/utils.js";
    import { verticalLoop, getRandomWinMap, getRandomLose } from "@/assets/projects/slotmachine/js/slotmachine.js";

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

    import BackgroundMusicTrack from "@/assets/projects/slotmachine/audio/sunny-fruit_strawberry.mp3";
    import SlotClickSfx from "@/assets/projects/slotmachine/audio/slot_click.mp3";
    import SlotTickSfx from "@/assets/projects/slotmachine/audio/slot_tick.mp3";
    import SlotWinSfx from "@/assets/projects/slotmachine/audio/slot_win.mp3";
    import SlotMegaWinSfx from "@/assets/projects/slotmachine/audio/slot_mega-win.mp3";
    import SlotWinJollySfx from "@/assets/projects/slotmachine/audio/slot_win-jolly.mp3";
    import SlotFreeSpinSfx from "@/assets/projects/slotmachine/audio/slot_free-spin.mp3";

    import SpinUI from "@/assets/projects/slotmachine/image/main/ui_spin.png";
    import AutoUI from "@/assets/projects/slotmachine/image/main/ui_auto.png";
    import BetUI from "@/assets/projects/slotmachine/image/main/ui_bet.png";
    import MinusUI from "@/assets/projects/slotmachine/image/main/ui_minus.png";
    import PlusUI from "@/assets/projects/slotmachine/image/main/ui_plus.png";
    import WinUI from "@/assets/projects/slotmachine/image/main/ui_win.png";
    import BalanceUI from "@/assets/projects/slotmachine/image/main/ui_balance.png";

    export default {
        name: "SlotMachine",

        setup() {
            const isMobile = isDeviceMobile();
            const isLoadingScreenActive = ref(true);
            const loaderProgress = ref('0');
            const isLoadingComplete = ref(false);
            const loaderBtnRef = ref(null);
            const SLOT_FONT = 'Rimbo-Regular';

            const canvasRef = ref(null);
            const ANIMATION_FPS = 24;
            const REELS_X_SLOT = 5;
            const REEL_LENGTH = 8;
            const SYMBOL_X_REEL = 3;

            const SYMBOLS = ['apple', 'cherry', 'coconut', 'grapefruit', 'lemon', 'watermelon'];
            const JOLLY = 'splash';
            const MEGA_WIN = 'fruitcocktail';
            let randomWinSymbol = null;

            const SLOT_MAP = {
                REEL_1_MAP: ['lemon', 'coconut', 'watermelon', 'cherry', 'fruitcocktail', 'grapefruit', 'apple', 'splash'],
                REEL_2_MAP: ['apple', 'cherry', 'coconut', 'fruitcocktail', 'grapefruit', 'lemon', 'splash', 'watermelon'],
                REEL_3_MAP: ['fruitcocktail', 'grapefruit', 'cherry', 'coconut', 'watermelon', 'splash', 'apple', 'lemon'],
                REEL_4_MAP: ['watermelon', 'splash', 'lemon', 'grapefruit', 'fruitcocktail', 'coconut', 'cherry', 'apple'],
                REEL_5_MAP: ['splash', 'apple', 'grapefruit', 'fruitcocktail', 'cherry', 'watermelon', 'coconut', 'lemon']
            };

            const reels = {
                reel1: {},
                reel2: {},
                reel3: {},
                reel4: {},
                reel5: {}
            };

            const slotAnimation = {
                reel1Animation: null,
                reel2Animation: null,
                reel3Animation: null,
                reel4Animation: null,
                reel5Animation: null
            };

            const conditions = [...Array(10).fill('lose'), ...Array(15).fill('fake-win'), ...Array(45).fill('win'), ...Array(5).fill('mega-win')];
            let selectedCondition = null;

            const jollyWinRatio = [1, ...Array(2).fill(0)]; // 1 => true, 0 => false
            let jollyRandomReel = null;

            const isGamePlaying = ref(false);

            let backgroundMusic;
            let slotClickFX;
            let slotTickFX;
            let slotWinFX;
            let slotMegaWinFX;
            let slotWinJollyFX;
            let slotFreeSpinFX;






            onMounted(() => {
                /*const onWindowResize = () => {
                    canvasRef.width = window.innerWidth;
                    canvasRef.height = window.innerHeight;
                };
                window.addEventListener('resize', onWindowResize);*/



                class GameScene extends Phaser.Scene {
                    constructor() {
                        super({ key: 'gameScene' });

                        this.TEXT_STYLE = { fontFamily: SLOT_FONT, color: '#ffffff' };

                        this.slotBody;
                        this.slotCanopy;
                        this.slotLogo;

                        this.characterMain;
                        this.characterDrink;

                        this.slotSpinUI;
                        this.slotAutoUI;
                        this.slotBetUI;
                        this.slotMinusUI;
                        this.slotPlusUI;
                        this.slotWinUI;
                        this.slotBalanceUI;

                        this.slotWinLabel;
                        this.slotWinValue;
                        this.slotAutoLabel;
                        this.slotSpinLabel;
                        this.slotBetLabel;
                        this.slotBetValue;
                        this.slotBalanceValue;
                    }

                    preload() {
                        /*this.input.enabled = false;
                        this.input.keyboard.enabled = false;
                        this.load.on('progress', (value) => {
                            loaderProgress.value = (value * 100).toFixed(2);
                        });
                        this.load.on('complete', () => {
                            isLoadingComplete.value = true;
                            loaderBtnRef.value.addEventListener('click', () => {
                                isLoadingScreenActive.value = false;
                                this.input.enabled = true;
                                this.input.keyboard.enabled = true;
                                backgroundMusic.play();
                            });
                        });*/

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

                        this.load.audio('background_music', BackgroundMusicTrack);
                        this.load.audio('slot-click_sfx', SlotClickSfx);
                        this.load.audio('slot-tick_sfx', SlotTickSfx);
                        this.load.audio('slot-win_sfx', SlotWinSfx);
                        this.load.audio('slot-mega-win_sfx', SlotMegaWinSfx);
                        this.load.audio('slot-win-jolly_sfx', SlotWinJollySfx);
                        this.load.audio('slot-free-spin_sfx', SlotFreeSpinSfx);

                        this.load.image('slot-spin_ui', SpinUI);
                        this.load.image('slot-auto_ui', AutoUI);
                        this.load.image('slot-bet_ui', BetUI);
                        this.load.image('slot-minus_ui', MinusUI);
                        this.load.image('slot-plus_ui', PlusUI);
                        this.load.image('slot-win_ui', WinUI);
                        this.load.image('slot-balance_ui', BalanceUI);
                    }

                    create() {
                        // Slot elements
                        this.slotBody = this.add.image(0, 0, 'slot_body').setOrigin(0, 0);
                        const ratio = this.slotBody.height / this.slotBody.width;
                        this.slotBody.displayWidth = isMobile ? (canvasRef.value.offsetWidth * 90) / 100 : (canvasRef.value.offsetWidth * 55) / 100;
                        this.slotBody.displayHeight = this.slotBody.displayWidth * ratio * 0.955;
                        this.slotBody.setPosition(canvasRef.value.offsetWidth / 2 - this.slotBody.displayWidth / 2, canvasRef.value.offsetHeight / 2 - this.slotBody.displayHeight / 2 - 20 * this.slotBody.scaleX);

                        this.characterDrink = this.add.sprite(0, 0, 'character-drink_sprite', 'character-drink-animation_01.png').setOrigin(0, 0);
                        this.characterDrink.visible = false;
                        this.characterDrink.setScale(1.1 * this.slotBody.scaleX, 1.1 * this.slotBody.scaleX);
                        this.characterDrink.setPosition(canvasRef.value.offsetWidth - this.characterDrink.displayWidth - (-10 * this.slotBody.scaleX), canvasRef.value.offsetHeight - this.characterDrink.displayHeight - (200 * this.slotBody.scaleX));
                        this.anims.create({
                            key: 'character-drink_animation',
                            frames: this.anims.generateFrameNames('character-drink_sprite', { start: 1, end: 40, zeroPad: 2, prefix: 'character-drink-animation_', suffix: '.png' }),
                            frameRate: ANIMATION_FPS,
                            repeat: -1
                        });

                        this.characterMain = this.add.sprite(0, 0, 'character-main_sprite', 'character-main-animation_01.png').setOrigin(0, 0);
                        this.characterMain.setScale(1.1 * this.slotBody.scaleX, 1.1 * this.slotBody.scaleX);
                        this.characterMain.setPosition(canvasRef.value.offsetWidth - this.characterMain.displayWidth - (30 * this.slotBody.scaleX), canvasRef.value.offsetHeight - this.characterMain.displayHeight - (200 * this.slotBody.scaleX));
                        this.anims.create({
                            key: 'character-main_animation',
                            frames: this.anims.generateFrameNames('character-main_sprite', { start: 1, end: 40, zeroPad: 2, prefix: 'character-main-animation_', suffix: '.png' }),
                            frameRate: ANIMATION_FPS / 1.5,
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

                        let xGap;
                        for (let i = 1; i <= REELS_X_SLOT; i++) {
                            switch (i) {
                                case 1:
                                    xGap = 34;
                                    break;
                                case 2:
                                    xGap = 376;
                                    break;
                                case 3:
                                    xGap = 718;
                                    break;
                                case 4:
                                    xGap = 1060;
                                    break;
                                case 5:
                                    xGap = 1402;
                            }

                            slotAnimation[`reel${i}Animation`] = generateReel(i, SLOT_MAP[`REEL_${i}_MAP`], xGap);
                        }



                        // Slot elements
                        this.slotCanopy = this.add.image(this.slotBody.x + this.slotBody.displayWidth / 2, this.slotBody.y - (140 * this.slotBody.scaleX), 'slot_canopy').setOrigin(0.5, 0);
                        this.slotCanopy.setScale(1 * this.slotBody.scaleX, 1 * this.slotBody.scaleX);
                        this.slotLogo = this.add.image(this.slotBody.x + this.slotBody.displayWidth / 2, this.slotBody.y - (190 * this.slotBody.scaleX), 'slot_logo').setOrigin(0.5, 0);
                        this.slotLogo.setScale(1 * this.slotBody.scaleX, 1 * this.slotBody.scaleX);



                        // Audio
                        backgroundMusic = this.sound.add('background_music', { volume: 0.4, loop: true });

                        slotClickFX = this.sound.add('slot-click_sfx', { volume: 0.6 });
                        slotTickFX = this.sound.add('slot-tick_sfx');
                        slotWinFX = this.sound.add('slot-win_sfx');
                        slotMegaWinFX = this.sound.add('slot-mega-win_sfx');
                        slotWinJollyFX = this.sound.add('slot-win-jolly_sfx');
                        slotFreeSpinFX = this.sound.add('slot-free-spin_sfx');



                        // UI/UX
                        const UI_BOTTOM_DISTANCE = 5;
                        this.TEXT_STYLE.shadow = {
                            offsetX: 5 * this.slotBody.scaleX,
                            offsetY: 5 * this.slotBody.scaleX,
                            color: '#000000',
                            blur: 10 * this.slotBody.scaleX,
                            fill: true,
                            fillAlpha: 1
                        };

                        this.slotWinUI = this.add.image(0, 0, 'slot-win_ui').setOrigin(0.5, 0);
                        this.slotWinUI.setScale(1 * this.slotBody.scaleX, 1 * this.slotBody.scaleX);
                        this.slotWinUI.setPosition(canvasRef.value.offsetWidth / 2, canvasRef.value.offsetHeight - this.slotWinUI.displayHeight - (UI_BOTTOM_DISTANCE * this.slotBody.scaleX));

                        this.slotWinLabel = this.add.text(this.slotWinUI.x, this.slotWinUI.y + (16 * this.slotBody.scaleX), 'win', { ...this.TEXT_STYLE, fontSize: 50 * this.slotBody.scaleX }).setOrigin(0.5, 0);
                        this.slotWinValue = this.add.text(this.slotWinUI.x, this.slotWinUI.y + (100 * this.slotBody.scaleX), '1000', { ...this.TEXT_STYLE, fontSize: 100 * this.slotBody.scaleX }).setOrigin(0.5, 0);


                        this.slotAutoUI = this.add.image(0, 0, 'slot-auto_ui').setOrigin(0.5, 0);
                        this.slotAutoUI.setScale(1 * this.slotBody.scaleX, 1 * this.slotBody.scaleX);
                        this.slotAutoUI.setPosition(this.slotWinUI.x + (550 * this.slotBody.scaleX), canvasRef.value.offsetHeight - this.slotAutoUI.displayHeight - (UI_BOTTOM_DISTANCE * this.slotBody.scaleX));

                        this.slotSpinUI = this.add.image(0, 0, 'slot-spin_ui').setOrigin(0.5, 0);
                        this.slotSpinUI.setScale(1 * this.slotBody.scaleX, 1 * this.slotBody.scaleX);
                        this.slotSpinUI.setPosition(this.slotWinUI.x + (840 * this.slotBody.scaleX), canvasRef.value.offsetHeight - this.slotSpinUI.displayHeight - (UI_BOTTOM_DISTANCE * this.slotBody.scaleX));

                        this.slotAutoLabel = this.add.text(this.slotAutoUI.x, this.slotAutoUI.y + (66 * this.slotBody.scaleX), 'auto', { ...this.TEXT_STYLE, fontSize: 40 * this.slotBody.scaleX }).setOrigin(0.5, 0);
                        this.slotSpinLabel = this.add.text(this.slotSpinUI.x, this.slotSpinUI.y + (40 * this.slotBody.scaleX), 'spin', { ...this.TEXT_STYLE, fontSize: 100 * this.slotBody.scaleX }).setOrigin(0.5, 0);


                        this.slotPlusUI = this.add.image(0, 0, 'slot-plus_ui').setOrigin(0.5, 0);
                        this.slotPlusUI.setScale(1 * this.slotBody.scaleX, 1 * this.slotBody.scaleX);
                        this.slotPlusUI.setPosition(this.slotWinUI.x - (520 * this.slotBody.scaleX), canvasRef.value.offsetHeight - this.slotPlusUI.displayHeight - (UI_BOTTOM_DISTANCE * this.slotBody.scaleX));

                        this.slotBetUI = this.add.image(0, 0, 'slot-bet_ui').setOrigin(0.5, 0);
                        this.slotBetUI.setScale(1 * this.slotBody.scaleX, 1 * this.slotBody.scaleX);
                        this.slotBetUI.setPosition(this.slotWinUI.x - (780 * this.slotBody.scaleX), canvasRef.value.offsetHeight - this.slotBetUI.displayHeight - (UI_BOTTOM_DISTANCE * this.slotBody.scaleX));

                        this.slotMinusUI = this.add.image(0, 0, 'slot-minus_ui').setOrigin(0.5, 0);
                        this.slotMinusUI.setScale(1 * this.slotBody.scaleX, 1 * this.slotBody.scaleX);
                        this.slotMinusUI.setPosition(this.slotWinUI.x - (1040 * this.slotBody.scaleX), canvasRef.value.offsetHeight - this.slotMinusUI.displayHeight - (UI_BOTTOM_DISTANCE * this.slotBody.scaleX));

                        this.slotBetLabel = this.add.text(this.slotBetUI.x, this.slotBetUI.y + (14 * this.slotBody.scaleX), 'bet', { ...this.TEXT_STYLE, fontSize: 50 * this.slotBody.scaleX }).setOrigin(0.5, 0);
                        this.slotBetValue = this.add.text(this.slotBetUI.x, this.slotBetUI.y + (84 * this.slotBody.scaleX), '100', { ...this.TEXT_STYLE, fontSize: 60 * this.slotBody.scaleX }).setOrigin(0.5, 0);


                        this.slotBalanceUI = this.add.image(0, 0, 'slot-balance_ui').setOrigin(0.5, 0);
                        this.slotBalanceUI.setScale(1 * this.slotBody.scaleX, 1 * this.slotBody.scaleX);
                        this.slotBalanceUI.setPosition(this.slotBody.x + (364 * this.slotBody.scaleX), this.slotBody.y - (72 * this.slotBody.scaleX));

                        this.slotBalanceValue = this.add.text(this.slotBalanceUI.x + (175 * this.slotBody.scaleX), this.slotBalanceUI.y + (15 * this.slotBody.scaleX), '999.999', { ...this.TEXT_STYLE, fontSize: 50 * this.slotBody.scaleX }).setOrigin(1, 0);



                        // Events control
                        let isAutoSpinActive = false;
                        let isGamePlayingWatch;

                        this.input.keyboard.on('keydown-SPACE', () => {
                            if (isAutoSpinActive) return;
                            this.spin();
                        });

                        this.slotSpinUI.setInteractive({ useHandCursor: true });
                        this.slotSpinUI.on('pointerdown', () => this.spin());

                        this.slotAutoUI.setInteractive({ useHandCursor: true });
                        this.slotAutoUI.on('pointerdown', () => {
                            if (isAutoSpinActive) {
                                isGamePlayingWatch(); // watch stop
                                isAutoSpinActive = false;
                                this.slotSpinUI.input.enabled = true;
                                this.slotAutoUI.setAlpha(1);
                                return;
                            }

                            isAutoSpinActive = true;
                            this.slotSpinUI.input.enabled = false;
                            this.slotAutoUI.setAlpha(0.5);
                            this.spin();

                            isGamePlayingWatch = watch(
                                () => isGamePlaying.value,
                                (val) => {
                                    if (!val) {
                                        if (selectedCondition === 'lose' || selectedCondition === 'fake-win') {
                                            setTimeout(() => {
                                                this.spin();
                                            }, 500);
                                        } else {
                                            setTimeout(() => {
                                                this.spin();
                                            }, 2000);
                                        }
                                    }
                                }
                            )
                        });
                    }

                    /*update() {
                        //
                    }*/



                    // Custom methods
                    spin() {
                        // ReturnToPlayer
                        // RandomNumberGenerator

                        if (isGamePlaying.value) return;

                        this.slotSpinUI.input.enabled = false;
                        isGamePlaying.value = true;
                        this.slotSpinUI.setAlpha(0.5);
                        this.slotSpinUI.input.cursor = false;
                        this.input.setDefaultCursor('default');
                        slotClickFX.play();

                        if (randomWinSymbol) {
                            for (let i = 1; i <= REELS_X_SLOT; i++) {
                                if (jollyRandomReel && i === jollyRandomReel) {
                                    reels[`reel${i}`][`${JOLLY}Sheet`].anims.stop();
                                    reels[`reel${i}`][`${JOLLY}Sheet`].setFrame(`${JOLLY}-animation_30.png`);
                                    jollyRandomReel = null;
                                    continue;
                                }
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

                        selectedCondition = conditions[getRandomNumber(0, conditions.length - 1)];

                        switch (selectedCondition) {
                            case 'lose':
                                indexReels = getRandomLose(indexReels, REELS_X_SLOT, SYMBOLS, SLOT_MAP);
                                break
                            case 'fake-win':
                            case 'win':
                            case 'mega-win':
                                randomWinSymbol = selectedCondition === 'win' ? SYMBOLS[getRandomNumber(0, SYMBOLS.length - 1)] : MEGA_WIN;

                                for (let i = 1; i <= REELS_X_SLOT; i++) {
                                    indexReels[`indexReel${i}`] = SLOT_MAP[`REEL_${i}_MAP`].indexOf(randomWinSymbol);
                                }

                                if (selectedCondition === 'fake-win') {
                                    const randomReel = getRandomNumber(1, REELS_X_SLOT);
                                    const filteredSymbols = [...SYMBOLS, MEGA_WIN].filter(el => el !== randomWinSymbol);
                                    const loseSymbol = filteredSymbols[getRandomNumber(0, filteredSymbols.length - 1)];
                                    indexReels[`indexReel${randomReel}`] = SLOT_MAP[`REEL_${randomReel}_MAP`].indexOf(loseSymbol);

                                    randomWinSymbol = null;
                                }

                                if (selectedCondition !== 'fake-win') {
                                    const jollyCondition = jollyWinRatio[getRandomNumber(0, jollyWinRatio.length -1)];

                                    if (jollyCondition) {
                                        jollyRandomReel = getRandomNumber(1, REELS_X_SLOT);
                                        indexReels[`indexReel${jollyRandomReel}`] = SLOT_MAP[`REEL_${jollyRandomReel}_MAP`].indexOf(JOLLY);
                                    }
                                }

                                indexReels = Object.assign(getRandomWinMap(indexReels));
                        }

                        const animRevolutions = 20; // Increase this value for faster animations
                        const animDuration = 4;
                        let newAnimDuration = getRandomNumber(30, 50);
                        newAnimDuration = newAnimDuration / 10;
                        const newAnimRevolutions = Math.floor((animRevolutions / animDuration) * newAnimDuration);

                        for (let i = 1; i <= REELS_X_SLOT; i++) {
                            let animDelay;
                            switch (i) {
                                case 1:
                                    animDelay = 0.10;
                                    break;
                                case 2:
                                    animDelay = 0.25;
                                    break;
                                case 3:
                                    animDelay = 0.42;
                                    break;
                                case 4:
                                    animDelay = 0.63;
                                    break;
                                case 5:
                                    animDelay = 0.91;
                            }

                            const animConfig = { duration: parseFloat((newAnimDuration + animDelay).toFixed(2)), revolutions: newAnimRevolutions, ease: 'power2.inOut' };
                            animConfig.onComplete = () => {
                                slotTickFX.play();
                                if (i === 5) this.animateOnComplete();
                            }

                            slotAnimation[`reel${i}Animation`].toIndex(indexReels[`indexReel${i}`], animConfig);
                        }
                    }

                    animateOnComplete() {
                        isGamePlaying.value = false;
                        this.slotSpinUI.input.enabled = true;
                        this.slotSpinUI.setAlpha(1);
                        this.slotSpinUI.input.cursor = 'pointer';

                        if (
                            this.input.x >= this.slotSpinUI.x - (this.slotSpinUI.displayWidth / 2) &&
                            this.input.x <= this.slotSpinUI.x - (this.slotSpinUI.displayWidth / 2) + this.slotSpinUI.displayWidth &&
                            this.input.y >= this.slotSpinUI.y &&
                            this.input.y <= this.slotSpinUI.y + this.slotSpinUI.displayHeight
                        ) {
                            this.input.setDefaultCursor('pointer');
                            this.slotSpinUI.on('pointerout', () => this.input.setDefaultCursor('default'));
                        }

                        if (!randomWinSymbol) return;

                        for (let i = 1; i <= REELS_X_SLOT; i++) {
                            if (jollyRandomReel && i === jollyRandomReel) {
                                reels[`reel${i}`][`${JOLLY}Sheet`].anims.play(`reel${i}-${JOLLY}_animation`);
                                continue;
                            }
                            reels[`reel${i}`][`${randomWinSymbol}Sheet`].anims.play(`reel${i}-${randomWinSymbol}_animation`);
                        }

                        if (selectedCondition === 'mega-win') slotMegaWinFX.play();
                        else if (jollyRandomReel) slotWinJollyFX.play(); // Not playing with mega win
                        else if (selectedCondition === 'win') slotWinFX.play(); // Not playing with jolly
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
                    }
                };

                const game = new Phaser.Game(config);
                game.scene.add('gameScene', GameScene);
                game.scene.start('gameScene');
            });

            return {
                isLoadingScreenActive,
                loaderProgress,
                isLoadingComplete,
                loaderBtnRef,
                canvasRef,
                isGamePlaying
            };
        },
    };
</script>

<style scoped>
    @font-face {
        font-family: Rimbo-Regular;
        src: url("@/assets/font/Rimbo-Regular.ttf") format('truetype');
    }
    #slot-machine {
        font-family: Rimbo-Regular, 'Ubuntu', sans-serif;
        color: #ffffff;
        text-shadow: 5px 5px 10px #000000;
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


    #slot-machine_loader {
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        z-index: 999;

        background-image: url("@/assets/projects/slotmachine/image/main/back.png");
        background-repeat: no-repeat;
        background-position: right bottom;
        background-size: cover;
    }

    #logo-full {
        width: calc(100% / 3);
    }
    #loader-btn {
        color: #be0100;
        font-size: 50px;
        margin: 25px 0;
        padding: 25px;
        border: 5px solid transparent;
        border-radius: 15px;
        transition: all 0.2s ease-in-out;
    }
    #loader-btn.complete {
        color: #ffffff;
        background-color: rgba(190, 0, 0, 1);
        border-color: #be0100;
    }
    #loader-btn.complete:hover {
        background-color: rgba(190, 0, 0, 0.8);
    }
    #progress-bar-container {
        width: 50%;
        height: 40px;
        border: 4px solid #be0100;
        background-color: #f36300;
        border-radius: calc(15px + 4px);
        padding: 4px;
        overflow: hidden;
    }
    #progress-bar {
        width: 0;
        height: 100%;
        background: rgb(254, 205, 0);
        background: linear-gradient(90deg, rgba(254, 205, 0, 1) 0%, rgba(255, 255, 255, 1) 100%);
        border-radius: 15px;
        transition: width 0.2s ease-in-out;
    }
</style>
