<template>
    <div id="slot-machine">
        <canvas ref="canvasRef"></canvas>

        <!-- Loading screen -->
        <div v-if="isLoadingScreenActive" id="slot-machine_loader" class="d-flex column justify-ctr align-ctr">
            <img id="logo-full" src="@/assets/projects/slotmachine/image/main/logo-full_COMPRESSED.png" alt="Fruit Cocktail" />

            <div 
                id="loader-btn" 
                :class="{ 'complete pointer': isLoadingComplete }"
                @click="isGameEntered = !isGameEntered"
            >
                {{ !isLoadingComplete ? 'loading' : 'enter' }}
            </div>

            <div id="progress-bar-container">
                <div id="progress-bar" :style="`width: ${loaderProgress}%`"></div>
            </div>
        </div>

        <!-- Settings menu -->
        <transition name="slot-machine-fade_setting">
            <i v-if="!isSettingOpened" @click="isSettingOpened = !isSettingOpened" id="menu-open-btn" class="fas fa-bars"></i>

            <div v-else id="setting-container" class="d-flex column justify-btw align-ctr">
                <i @click="isSettingOpened = !isSettingOpened" id="menu-close-btn" class="fa-solid fa-xmark"></i>

                <div id="setting-title">settings</div>

                <div class="action-container">
                    <router-link to="/"><i class="fas fa-house"></i></router-link>

                    <i @click="setVolume()" v-if="!isVolumeActive" class="fas fa-volume-high"></i>
                    <i @click="setVolume()" v-if="isVolumeActive" class="fas fa-volume-xmark"></i>
                </div>

                <div class="w-100 text-ctr">
                    <div id="pay-table-title">pay table</div>
                    <img id="pay-table-img" src="@/assets/projects/slotmachine/image/main/paytable_COMPRESSED.png" />

                    <div class="free-spin-text">free spin = min bet</div>
                    <div class="bet-text mt-10">min bet = 100</div>
                    <div class="bet-text mt-10">max bet = 1,000</div>

                    <div id="bet-container">
                        <div class="symbol-container">
                            <div class="symbol-text mb-10">symbols = bet x 2</div>
                            <img v-for="symbol in SYMBOLS" class="symbol-icon" :src="assetsUrl(`projects/slotmachine/image/icon/${symbol}_COMPRESSED.png`)" :key="symbol" />
                        </div>

                        <div class="symbol-container">
                            <div class="symbol-text mb-10">jolly = bet x 3</div>
                            <img class="symbol-icon" src="@/assets/projects/slotmachine/image/icon/splash_COMPRESSED.png" />
                        </div>

                        <div class="symbol-container">
                            <div class="symbol-text mb-10">mega win = bet x 5</div>
                            <img class="symbol-icon" src="@/assets/projects/slotmachine/image/icon/fruitcocktail_COMPRESSED.png" />
                        </div>
                    </div>
                </div>
            </div>
        </transition>

        <!-- MOBILE ONLY - full screen handler -->
        <div v-if="isMobile" id="full-screen-handler">
            <i v-if="!isFullScreenActive" class="fas fa-maximize" @click="enterFullScreen()"></i>
            <i v-if="isFullScreenActive" class="fas fa-minimize" @click="exitFullScreen()"></i>
        </div>
    </div>
</template>


<script>
// UTILS
import { ref, onMounted, watch, onUnmounted } from 'vue';
import Phaser from 'phaser';
import { assetsUrl, isDeviceMobile, getRandomNumber, formatNumber } from '@/assets/js/utils.js';
import { verticalLoop, getRandomWinMap, getRandomLose, getRandomFakeWin } from '@/assets/projects/slotmachine/js/slotmachine.js';


// ASSETS
// slot elements
import SlotBodyImage from '@/assets/projects/slotmachine/image/main/reel_COMPRESSED.png';
import SlotCanopyImage from '@/assets/projects/slotmachine/image/main/canopy_COMPRESSED.png';
import SlotLogoImage from '@/assets/projects/slotmachine/image/main/logo_COMPRESSED.png';
import SlotSplashLeftImage from '@/assets/projects/slotmachine/image/main/splash_left_COMPRESSED.png';
import SlotSplashRightImage from '@/assets/projects/slotmachine/image/main/splash_right_COMPRESSED.png';

// character
import CharacterMainPng from '@/assets/projects/slotmachine/image/sprite/character-main_spritesheet_COMPRESSED.png';
import CharacterMainJson from '@/assets/projects/slotmachine/image/sprite/character-main_spritesheet.json';
import CharacterDrinkPng from '@/assets/projects/slotmachine/image/sprite/character-drink_spritesheet_COMPRESSED.png';
import CharacterDrinkJson from '@/assets/projects/slotmachine/image/sprite/character-drink_spritesheet.json';

// symbols
import AppleSpritePng from '@/assets/projects/slotmachine/image/sprite/apple_spritesheet_COMPRESSED.png';
import AppleSpriteJson from '@/assets/projects/slotmachine/image/sprite/apple_spritesheet.json';
import CherrySpritePng from '@/assets/projects/slotmachine/image/sprite/cherry_spritesheet_COMPRESSED.png';
import CherrySpriteJson from '@/assets/projects/slotmachine/image/sprite/cherry_spritesheet.json';
import CoconutSpritePng from '@/assets/projects/slotmachine/image/sprite/coconut_spritesheet_COMPRESSED.png';
import CoconutSpriteJson from '@/assets/projects/slotmachine/image/sprite/coconut_spritesheet.json';
import FruitcocktailSpritePng from '@/assets/projects/slotmachine/image/sprite/fruitcocktail_spritesheet_COMPRESSED.png';
import FruitcocktailSpriteJson from '@/assets/projects/slotmachine/image/sprite/fruitcocktail_spritesheet.json';
import GrapefruitSpritePng from '@/assets/projects/slotmachine/image/sprite/grapefruit_spritesheet_COMPRESSED.png';
import GrapefruitSpriteJson from '@/assets/projects/slotmachine/image/sprite/grapefruit_spritesheet.json';
import LemonSpritePng from '@/assets/projects/slotmachine/image/sprite/lemon_spritesheet_COMPRESSED.png';
import LemonSpriteJson from '@/assets/projects/slotmachine/image/sprite/lemon_spritesheet.json';
import SplashSpritePng from '@/assets/projects/slotmachine/image/sprite/splash_spritesheet_COMPRESSED.png';
import SplashSpriteJson from '@/assets/projects/slotmachine/image/sprite/splash_spritesheet.json';
import WatermelonSpritePng from '@/assets/projects/slotmachine/image/sprite/watermelon_spritesheet_COMPRESSED.png';
import WatermelonSpriteJson from '@/assets/projects/slotmachine/image/sprite/watermelon_spritesheet.json';

// audio
import BackgroundMusicTrack from '@/assets/projects/slotmachine/audio/sunny-fruit_strawberry_COMPRESSED.mp3';
import SlotClickSfx from '@/assets/projects/slotmachine/audio/slot_click_COMPRESSED.mp3';
import SlotTickSfx from '@/assets/projects/slotmachine/audio/slot_tick_COMPRESSED.mp3';
import SlotWinSfx from '@/assets/projects/slotmachine/audio/slot_win_COMPRESSED.mp3';
import SlotMegaWinSfx from '@/assets/projects/slotmachine/audio/slot_mega-win_COMPRESSED.mp3';
import SlotWinJollySfx from '@/assets/projects/slotmachine/audio/slot_win-jolly_COMPRESSED.mp3';
import SlotFreeSpinSfx from '@/assets/projects/slotmachine/audio/slot_free-spin_COMPRESSED.mp3';

// ui elements
import SpinUI from '@/assets/projects/slotmachine/image/main/ui_spin_COMPRESSED.png';
import AutoUI from '@/assets/projects/slotmachine/image/main/ui_auto_COMPRESSED.png';
import ForwardIcon from '@/assets/projects/slotmachine/image/main/FA-icon-forward_white_COMPRESSED.png';
import BetUI from '@/assets/projects/slotmachine/image/main/ui_bet_COMPRESSED.png';
import MinusUI from '@/assets/projects/slotmachine/image/main/ui_minus_COMPRESSED.png';
import PlusUI from '@/assets/projects/slotmachine/image/main/ui_plus_COMPRESSED.png';
import WinUI from '@/assets/projects/slotmachine/image/main/ui_win_COMPRESSED.png';
import BalanceUI from '@/assets/projects/slotmachine/image/main/ui_balance_COMPRESSED.png';
import CoinImage from '@/assets/projects/slotmachine/image/main/coin_COMPRESSED.png';
import BubbleImage from '@/assets/projects/slotmachine/image/main/bubble_COMPRESSED.png';

// other
import MegaWinTextImage from '@/assets/projects/slotmachine/image/main/megawin_text_COMPRESSED.png';
import MegaWinCoinImage from '@/assets/projects/slotmachine/image/main/megawin_coin_COMPRESSED.png';



export default {
    name: 'SlotMachine',

    setup() {
        // utils
        const isMobile = isDeviceMobile();
        let wakeLock; // Screen sleep lock
        const isLoadingScreenActive = ref(true);
        const loaderProgress = ref('0');
        const isLoadingComplete = ref(false);
        const isGameEntered = ref(false);
        const isSettingOpened = ref(false);
        const isVolumeActive = ref(true);
        const SLOT_FONT = 'Rimbo-Regular';
        
        const isIphone = /iPhone/i.test(navigator.userAgent); // Iphone bottom bar overlay fix

        const canvasRef = ref(null);
        const ANIMATION_FPS = 24;
        const ANIMATION_DURATION = 1250;
        const REELS_X_SLOT = 5;
        const REEL_LENGTH = 8;
        const SYMBOL_X_REEL = 3;

        const SYMBOLS = ['apple', 'cherry', 'coconut', 'grapefruit', 'lemon', 'watermelon'];
        const JOLLY = 'splash';
        const MEGA_WIN = 'fruitcocktail';
        let randomWinSymbol = null;

        // Never set on 0 index 'splash' or 'coconut' because they have a special animation
        const SLOT_MAP = {
            REEL_1_MAP: ['lemon', 'coconut', 'watermelon', 'cherry', 'fruitcocktail', 'splash', 'grapefruit', 'apple'],
            REEL_2_MAP: ['apple', 'cherry', 'coconut', 'fruitcocktail', 'grapefruit', 'lemon', 'splash', 'watermelon'],
            REEL_3_MAP: ['fruitcocktail', 'grapefruit', 'cherry', 'coconut', 'splash', 'watermelon', 'apple', 'lemon'],
            REEL_4_MAP: ['watermelon', 'splash', 'lemon', 'grapefruit', 'fruitcocktail', 'coconut', 'cherry', 'apple'],
            REEL_5_MAP: ['apple', 'grapefruit', 'splash', 'fruitcocktail', 'cherry', 'watermelon', 'coconut', 'lemon']
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

        const conditions = [...Array(4).fill('lose'), ...Array(6).fill('fake-win'), ...Array(10).fill('win'), ...Array(1).fill('mega-win')];
        let selectedCondition = null;

        const jollyWinRatio = [1, ...Array(4).fill(0)]; // 1 => true, 0 => false
        let jollyRandomReel = null;

        const isGamePlaying = ref(false);


        // audio
        const mixerAudio = {
            backgroundMusic: null,
            slotClickFX: null,
            slotTickFX: null,
            slotWinFX: null,
            slotMegaWinFX: null,
            slotWinJollyFX: null,
            slotFreeSpinFX: null,
        }
        const volumeCopy = {};

        const setVolume = () => {
            if (isVolumeActive.value) {
                for (const key in mixerAudio) {
                    volumeCopy[key] = mixerAudio[key].volume;

                    mixerAudio[key].setVolume(0);
                }
            }

            if (!isVolumeActive.value) {
                for (const key in mixerAudio) {
                    mixerAudio[key].setVolume(volumeCopy[key]);
                }
            }

            isVolumeActive.value = !isVolumeActive.value;
        }


        // MOBILE ONLY - fullscreen + rotation lock
        const isFullScreenActive = ref(false);
        const enterFullScreen = () => {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
                screen.orientation.lock('portrait-primary'); // auto unlock
                isFullScreenActive.value = true;
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen();
                screen.orientation.lock('portrait-primary'); // auto unlock
                isFullScreenActive.value = true;
            }
        }
        const exitFullScreen = () => {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                isFullScreenActive.value = false;
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
                isFullScreenActive.value = false;
            }
        }



        // INIT
        document.title = '0xbrax | Slot Machine';

        onMounted(async () => {
            try {
                wakeLock = await navigator.wakeLock.request('screen');
            } catch (err) {
                //
            }
            if (wakeLock) {
                document.addEventListener('visibilitychange', async () => {
                    if (document.visibilityState === 'visible') {
                        wakeLock = await navigator.wakeLock.request('screen');
                    } else {
                        wakeLock.release();
                    }
                });
            }


            // GAME SCENE
            class GameScene extends Phaser.Scene {
                constructor() {
                    super({ key: 'gameScene' });

                    // utils
                    this.TEXT_STYLE = { fontFamily: SLOT_FONT, color: '#ffffff', resolution: 2 };
                    this.isAutoSpinActive = false;
                    this.isFastForwardActive = false;

                    this.symbolsAnimations = {};

                    // slot elements
                    this.slotBody;
                    this.slotCanopy;
                    this.slotLogo;
                    this.slotSplashLeft;
                    this.slotSplashRight;

                    // character
                    this.characterMain;
                    this.characterDrink;

                    // ui elements
                    this.slotSpinUI;
                    this.slotAutoUI;
                    this.slotForwardUI;
                    this.slotBetUI;
                    this.slotMinusUI;
                    this.slotPlusUI;
                    this.slotWinUI;
                    this.slotBalanceUI;

                    this.slotWinLabel;
                    this.slotWinValue;
                    this.slotAutoLabel;
                    this.slotSpinLabel;
                    this.slotForward;
                    this.slotBetLabel;
                    this.slotBetValue;
                    this.slotBalanceValue;
                    this.slotBalanceCoin;

                    // free spin
                    this.freeSpinContainer;
                    this.freeSpinShadow;
                    this.freeSpinLevel;
                    this.freeSpinParticles;
                    this.freeSpinLevelAnimation;
                    this.freeSpinLabel;
                    this.freeSpinLabelAnimation;
                    this.freeSpinValue = 0;
                    this.lastBetBeforeFreeSpin;
                    this.freeSpinIncrement = 10;

                    // mega win
                    this.megaWinScreenOverlay;
                    this.megaWinScreenText;
                    this.megaWinScreenCoin;
                    this.megaWinScreenAnimation = {};

                    // slot settings
                    this.slotBet = 200;
                    this.slotBetIncrement = 100;
                    this.slotWin = null;
                    this.slotBalance = 1_000_000;
                    this.slotWinMultiplier = 2;
                    this.slotWinJollyMultiplier = 3;
                    this.slotMegaWinMultiplier = 5;
                }

                preload() {
                    // Loading handler
                    this.input.enabled = false;
                    this.input.keyboard.enabled = false;
                    this.load.on('progress', (value) => {
                        loaderProgress.value = (value * 100).toFixed(2);
                    });
                    this.load.on('complete', () => {
                        canvasRef.value.style.marginTop = 0;
                        this.game.scale.refresh();
                        isLoadingComplete.value = true;
                    });
                    watch(
                        () => isGameEntered.value,
                        (val) => {
                            if (val) {
                                isLoadingScreenActive.value = false;
                                this.input.enabled = true;
                                this.input.keyboard.enabled = true;
                                mixerAudio.backgroundMusic.play();

                                if (isMobile) { // MOBILE ONLY - fullscreen + rotation lock
                                    if (document.documentElement.requestFullscreen) {
                                        document.documentElement.requestFullscreen();
                                        screen.orientation.lock('portrait-primary'); // auto unlock
                                        isFullScreenActive.value = true;
                                        document.addEventListener('fullscreenchange', () => {
                                            if (!document.fullscreenElement) isFullScreenActive.value = false;
                                        });
                                    } else if (document.documentElement.webkitRequestFullscreen) {
                                        document.documentElement.webkitRequestFullscreen();
                                        screen.orientation.lock('portrait-primary'); // auto unlock
                                        isFullScreenActive.value = true;
                                        document.addEventListener('webkitfullscreenchange', () => {
                                            if (!document.webkitFullscreenElemen) isFullScreenActive.value = false;
                                        });
                                    }
                                }
                            }
                        }
                    );

                    // slot elements
                    this.load.image('slot_body', SlotBodyImage);
                    this.load.image('slot_canopy', SlotCanopyImage);
                    this.load.image('slot_logo', SlotLogoImage);
                    this.load.image('slot_splash-left', SlotSplashLeftImage);
                    this.load.image('slot_splash-right', SlotSplashRightImage);

                    // character
                    this.load.atlas('character-main_sprite', CharacterMainPng, CharacterMainJson);
                    this.load.atlas('character-drink_sprite', CharacterDrinkPng, CharacterDrinkJson);

                    // symbols
                    this.load.atlas('apple_sprite', AppleSpritePng, AppleSpriteJson);
                    this.load.atlas('cherry_sprite', CherrySpritePng, CherrySpriteJson);
                    this.load.atlas('coconut_sprite', CoconutSpritePng, CoconutSpriteJson);
                    this.load.atlas('fruitcocktail_sprite', FruitcocktailSpritePng, FruitcocktailSpriteJson);
                    this.load.atlas('grapefruit_sprite', GrapefruitSpritePng, GrapefruitSpriteJson);
                    this.load.atlas('lemon_sprite', LemonSpritePng, LemonSpriteJson);
                    this.load.atlas('splash_sprite', SplashSpritePng, SplashSpriteJson);
                    this.load.atlas('watermelon_sprite', WatermelonSpritePng, WatermelonSpriteJson);

                    // audio
                    this.load.audio('background_music', BackgroundMusicTrack);
                    this.load.audio('slot-click_sfx', SlotClickSfx);
                    this.load.audio('slot-tick_sfx', SlotTickSfx);
                    this.load.audio('slot-win_sfx', SlotWinSfx);
                    this.load.audio('slot-mega-win_sfx', SlotMegaWinSfx);
                    this.load.audio('slot-win-jolly_sfx', SlotWinJollySfx);
                    this.load.audio('slot-free-spin_sfx', SlotFreeSpinSfx);

                    // ui elements
                    this.load.image('slot-spin_ui', SpinUI);
                    this.load.image('slot-auto_ui', AutoUI);
                    this.load.image('slot-forward_icon', ForwardIcon);
                    this.load.image('slot-bet_ui', BetUI);
                    this.load.image('slot-minus_ui', MinusUI);
                    this.load.image('slot-plus_ui', PlusUI);
                    this.load.image('slot-win_ui', WinUI);
                    this.load.image('slot-balance_ui', BalanceUI);

                    this.load.image('mega-win_text', MegaWinTextImage);
                    this.load.image('mega-win_coin', MegaWinCoinImage);
                    this.load.image('slot_coin', CoinImage);
                    this.load.image('freespin_bubble', BubbleImage);
                }

                create() {
                    // slot elements
                    this.slotBody = this.add.image(0, 0, 'slot_body').setOrigin(0, 0);
                    const ratio = this.slotBody.height / this.slotBody.width;
                    this.slotBody.displayWidth = isMobile ? (canvasRef.value.offsetWidth * 95) / 100 : (canvasRef.value.offsetHeight * 102) / 100;
                    this.slotBody.displayHeight = this.slotBody.displayWidth * ratio * 0.955;
                    this.slotBody.setPosition(canvasRef.value.offsetWidth / 2 - this.slotBody.displayWidth / 2, canvasRef.value.offsetHeight / 2 - this.slotBody.displayHeight / 2 - 20 * this.slotBody.scaleX);

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

                        slotAnimation[`reel${i}Animation`] = this.generateReel(i, SLOT_MAP[`REEL_${i}_MAP`], xGap);
                    }

                    this.slotCanopy = this.add.image(this.slotBody.x + this.slotBody.displayWidth / 2, this.slotBody.y - (140 * this.slotBody.scaleX), 'slot_canopy').setOrigin(0.5, 0);
                    this.slotCanopy.setScale(1 * this.slotBody.scaleX, 1 * this.slotBody.scaleX);
                    this.slotLogo = this.add.image(this.slotBody.x + this.slotBody.displayWidth / 2, this.slotBody.y - (190 * this.slotBody.scaleX), 'slot_logo').setOrigin(0.5, 0);
                    this.slotLogo.setScale(1 * this.slotBody.scaleX, 1 * this.slotBody.scaleX);
                    this.slotSplashLeft = this.add.image(this.slotBody.x - (176 * this.slotBody.scaleX), this.slotBody.y + (390 * this.slotBody.scaleX), 'slot_splash-left').setOrigin(0, 0);
                    this.slotSplashLeft.setScale(1 * this.slotBody.scaleX, 1 * this.slotBody.scaleX);
                    this.slotSplashRight = this.add.image(this.slotBody.x + (1749 * this.slotBody.scaleX), this.slotBody.y + (390 * this.slotBody.scaleX), 'slot_splash-right').setOrigin(0, 0);
                    this.slotSplashRight.setScale(1 * this.slotBody.scaleX, 1 * this.slotBody.scaleX);


                    // character
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


                    // audio
                    mixerAudio.backgroundMusic = this.sound.add('background_music', { volume: 0.5, loop: true });

                    mixerAudio.slotClickFX = this.sound.add('slot-click_sfx', { volume: 0.5, loop: false });
                    mixerAudio.slotTickFX = this.sound.add('slot-tick_sfx', { volume: 0.5, loop: false });
                    mixerAudio.slotWinFX = this.sound.add('slot-win_sfx');
                    mixerAudio.slotMegaWinFX = this.sound.add('slot-mega-win_sfx');
                    mixerAudio.slotWinJollyFX = this.sound.add('slot-win-jolly_sfx');
                    mixerAudio.slotFreeSpinFX = this.sound.add('slot-free-spin_sfx');


                    // ui elements
                    const UI_BOTTOM_DISTANCE = 5;
                    this.TEXT_STYLE.shadow = {
                        offsetX: 15 * this.slotBody.scaleX,
                        offsetY: 15 * this.slotBody.scaleX,
                        color: '#000000',
                        blur: 20 * this.slotBody.scaleX,
                        fill: true,
                        fillAlpha: 1
                    };
                    this.TEXT_STYLE.padding = this.TEXT_STYLE.shadow.blur;

                    this.slotWinUI = isMobile ? this.add.image(0, 0, 'slot-bet_ui').setOrigin(0.5, 0) : this.add.image(0, 0, 'slot-win_ui').setOrigin(0.5, 0);
                    this.slotWinUI.setScale(1 * this.slotBody.scaleX, 1 * this.slotBody.scaleX);
                    this.slotWinUI.setPosition(canvasRef.value.offsetWidth / 2, canvasRef.value.offsetHeight - this.slotWinUI.displayHeight - (UI_BOTTOM_DISTANCE * this.slotBody.scaleX));

                    this.slotWinLabel = this.add.text(this.slotWinUI.x, this.slotWinUI.y + (-4 * this.slotBody.scaleX), 'win', { ...this.TEXT_STYLE, fontSize: 50 * this.slotBody.scaleX }).setOrigin(0.5, 0);
                    this.slotWinValue = this.add.text(this.slotWinUI.x, this.slotWinUI.y + (80 * this.slotBody.scaleX), formatNumber(this.slotWin), { ...this.TEXT_STYLE, fontSize: 100 * this.slotBody.scaleX }).setOrigin(0.5, 0);

                    this.slotAutoUI = this.add.image(0, 0, 'slot-auto_ui').setOrigin(0.5, 0);
                    this.slotAutoUI.setScale(1 * this.slotBody.scaleX, 1 * this.slotBody.scaleX);
                    this.slotAutoUI.setPosition(this.slotWinUI.x + (550 * this.slotBody.scaleX), canvasRef.value.offsetHeight - this.slotAutoUI.displayHeight - (UI_BOTTOM_DISTANCE * this.slotBody.scaleX));

                    this.slotSpinUI = this.add.image(0, 0, 'slot-spin_ui').setOrigin(0.5, 0);
                    this.slotSpinUI.setScale(1 * this.slotBody.scaleX, 1 * this.slotBody.scaleX);
                    this.slotSpinUI.setPosition(this.slotWinUI.x + (840 * this.slotBody.scaleX), canvasRef.value.offsetHeight - this.slotSpinUI.displayHeight - (UI_BOTTOM_DISTANCE * this.slotBody.scaleX));

                    this.slotForwardUI = this.add.image(0, 0, 'slot-auto_ui').setOrigin(0.5, 0);
                    this.slotForwardUI.setScale(1 * this.slotBody.scaleX, 1 * this.slotBody.scaleX);
                    this.slotForwardUI.setPosition(this.slotWinUI.x + (1130 * this.slotBody.scaleX), canvasRef.value.offsetHeight - this.slotForwardUI.displayHeight - (UI_BOTTOM_DISTANCE * this.slotBody.scaleX));

                    this.slotAutoLabel = this.add.text(this.slotAutoUI.x, this.slotAutoUI.y + (46 * this.slotBody.scaleX), 'auto', { ...this.TEXT_STYLE, fontSize: 40 * this.slotBody.scaleX }).setOrigin(0.5, 0);
                    this.slotSpinLabel = this.add.text(this.slotSpinUI.x, this.slotSpinUI.y + (20 * this.slotBody.scaleX), 'spin', { ...this.TEXT_STYLE, fontSize: 100 * this.slotBody.scaleX }).setOrigin(0.5, 0);
                    this.slotForward = this.add.image(0, 0, 'slot-forward_icon');
                    this.slotForward.setScale(0.16 * this.slotBody.scaleX, 0.16 * this.slotBody.scaleX);
                    this.slotForward.setPosition(this.slotForwardUI.x, this.slotForwardUI.y + (86 * this.slotBody.scaleX));

                    this.slotPlusUI = this.add.image(0, 0, 'slot-plus_ui').setOrigin(0.5, 0);
                    this.slotPlusUI.setScale(1 * this.slotBody.scaleX, 1 * this.slotBody.scaleX);
                    this.slotPlusUI.setPosition(this.slotWinUI.x - (520 * this.slotBody.scaleX), canvasRef.value.offsetHeight - this.slotPlusUI.displayHeight - (UI_BOTTOM_DISTANCE * this.slotBody.scaleX));

                    this.slotBetUI = this.add.image(0, 0, 'slot-bet_ui').setOrigin(0.5, 0);
                    this.slotBetUI.setScale(1 * this.slotBody.scaleX, 1 * this.slotBody.scaleX);
                    this.slotBetUI.setPosition(this.slotWinUI.x - (780 * this.slotBody.scaleX), canvasRef.value.offsetHeight - this.slotBetUI.displayHeight - (UI_BOTTOM_DISTANCE * this.slotBody.scaleX));

                    this.slotMinusUI = this.add.image(0, 0, 'slot-minus_ui').setOrigin(0.5, 0);
                    this.slotMinusUI.setScale(1 * this.slotBody.scaleX, 1 * this.slotBody.scaleX);
                    this.slotMinusUI.setPosition(this.slotWinUI.x - (1040 * this.slotBody.scaleX), canvasRef.value.offsetHeight - this.slotMinusUI.displayHeight - (UI_BOTTOM_DISTANCE * this.slotBody.scaleX));

                    this.slotBetLabel = this.add.text(this.slotBetUI.x, this.slotBetUI.y + (-4 * this.slotBody.scaleX), 'bet', { ...this.TEXT_STYLE, fontSize: 50 * this.slotBody.scaleX }).setOrigin(0.5, 0);
                    this.slotBetValue = this.add.text(this.slotBetUI.x, this.slotBetUI.y + (64 * this.slotBody.scaleX), formatNumber(this.slotBet), { ...this.TEXT_STYLE, fontSize: 60 * this.slotBody.scaleX }).setOrigin(0.5, 0);

                    this.slotBalanceUI = this.add.image(0, 0, 'slot-balance_ui').setOrigin(0.5, 0);
                    this.slotBalanceUI.setScale(1 * this.slotBody.scaleX, 1 * this.slotBody.scaleX);
                    this.slotBalanceUI.setPosition(this.slotBody.x + (364 * this.slotBody.scaleX), this.slotBody.y - (72 * this.slotBody.scaleX));

                    this.slotBalanceValue = this.add.text(this.slotBalanceUI.x + (194 * this.slotBody.scaleX), this.slotBalanceUI.y + (-4 * this.slotBody.scaleX), formatNumber(this.slotBalance), { ...this.TEXT_STYLE, fontSize: 50 * this.slotBody.scaleX }).setOrigin(1, 0);
                    this.slotBalanceCoin = this.add.image(0, 0, 'slot_coin').setOrigin(0, 0);
                    this.slotBalanceCoin.setScale(1.4 * this.slotBody.scaleX, 1.4 * this.slotBody.scaleX);
                    this.slotBalanceCoin.setPosition(this.slotBalanceUI.x - (304 * this.slotBody.scaleX), this.slotBalanceUI.y);


                    const freeSpinWidth = 50 * this.slotBody.scaleX;
                    const freeSpinHeight = 800 * this.slotBody.scaleX;
                    const freeSpinBorder = 10 * this.slotBody.scaleX;
                    const freeSpinRadius = freeSpinWidth / 2;

                    this.freeSpinShadow = this.add.graphics();
                    this.freeSpinShadow.fillStyle(0x4bc8ff, 0.5);
                    this.freeSpinShadow.fillRoundedRect(0, 0, freeSpinWidth, freeSpinHeight, freeSpinRadius);
                    this.freeSpinShadow.setPosition(250 * this.slotBody.scaleX, (canvasRef.value.offsetHeight / 2) - (freeSpinHeight / 2));

                    this.freeSpinLevel = this.add.graphics();
                    this.freeSpinLevel.fillStyle(0xf36300, 0.8);
                    this.freeSpinLevel.fillRect(0, 0, freeSpinWidth, freeSpinHeight);
                    this.freeSpinLevel.scaleY = 0;
                    this.freeSpinLevel.setPosition(this.freeSpinShadow.x, this.freeSpinShadow.y + freeSpinHeight);

                    this.freeSpinContainer = this.add.graphics();
                    this.freeSpinContainer.lineStyle(freeSpinBorder, 0x3c0159);
                    this.freeSpinContainer.strokeRoundedRect(0, 0, freeSpinWidth, freeSpinHeight, freeSpinRadius);
                    this.freeSpinContainer.setPosition(250 * this.slotBody.scaleX, this.freeSpinShadow.y);

                    this.freeSpinLevel.setMask(this.freeSpinShadow.createGeometryMask());

                    if (!isMobile) this.freeSpinLabel = this.add.text(this.freeSpinContainer.x + (20 * this.slotBody.scaleX), this.freeSpinContainer.y - (100 * this.slotBody.scaleX), 'free\nspin', { ...this.TEXT_STYLE, fontSize: 80 * this.slotBody.scaleX }).setOrigin(0.5, 0.5);



                    // MOBILE adapt
                    if (isMobile) {
                        // slot elements
                        this.slotLogo.setScale(1.5 * this.slotBody.scaleX, 1.5 * this.slotBody.scaleX);
                        this.slotLogo.y = this.slotBody.y - (300 * this.slotBody.scaleX);

                        // character
                        this.characterDrink.setPosition(canvasRef.value.offsetWidth - this.characterDrink.displayWidth - (10 * this.slotBody.scaleX), this.slotBody.y - (650 * this.slotBody.scaleX));
                        this.characterMain.setPosition(canvasRef.value.offsetWidth - this.characterMain.displayWidth - (50 * this.slotBody.scaleX), this.slotBody.y - (600 * this.slotBody.scaleX));

                        // ui elements
                        this.slotBalanceUI.setScale(2 * this.slotBody.scaleX, 2 * this.slotBody.scaleX);
                        this.slotBalanceUI.setPosition(this.slotBody.x + this.slotBody.displayWidth / 2, 50 * this.slotBody.scaleX);
                        this.slotBalanceValue.setFontSize(100 * this.slotBody.scaleX);
                        this.slotBalanceValue.setPosition(this.slotBalanceUI.x + (354 * this.slotBody.scaleX), this.slotBalanceUI.y + (12 * this.slotBody.scaleX));
                        this.slotBalanceCoin.setScale(2.8 * this.slotBody.scaleX, 2.8 * this.slotBody.scaleX);
                        this.slotBalanceCoin.setPosition(this.slotBalanceUI.x - (620 * this.slotBody.scaleX), this.slotBalanceUI.y);

                        this.slotWinUI.setScale(2 * this.slotBody.scaleX, 2 * this.slotBody.scaleX);
                        this.slotWinUI.setPosition(this.slotBalanceUI.x, 255 * this.slotBody.scaleX);
                        this.slotWinLabel.setFontSize(110 * this.slotBody.scaleX);
                        this.slotWinLabel.setPosition(this.slotWinUI.x, this.slotWinUI.y + (6 * this.slotBody.scaleX));
                        this.slotWinValue.setFontSize(140 * this.slotBody.scaleX);
                        this.slotWinValue.setPosition(this.slotWinUI.x, this.slotWinUI.y + (140 * this.slotBody.scaleX));

                        this.slotBetUI.setScale(1.5 * this.slotBody.scaleX, 1.5 * this.slotBody.scaleX);
                        this.slotBetUI.setPosition(this.slotBalanceUI.x, canvasRef.value.offsetHeight - this.slotBetUI.displayHeight - (50 * this.slotBody.scaleX));
                        this.slotBetLabel.setFontSize(80 * this.slotBody.scaleX);
                        this.slotBetLabel.setPosition(this.slotBetUI.x, this.slotBetUI.y + (-2 * this.slotBody.scaleX));
                        this.slotBetValue.setFontSize(120 * this.slotBody.scaleX);
                        this.slotBetValue.setPosition(this.slotBetUI.x, this.slotBetUI.y + (94 * this.slotBody.scaleX));

                        this.slotPlusUI.setScale(1.5 * this.slotBody.scaleX, 1.5 * this.slotBody.scaleX);
                        this.slotPlusUI.setPosition(this.slotBetUI.x + (415 * this.slotBody.scaleX), canvasRef.value.offsetHeight - this.slotPlusUI.displayHeight - (50 * this.slotBody.scaleX));
                        this.slotMinusUI.setScale(1.5 * this.slotBody.scaleX, 1.5 * this.slotBody.scaleX);
                        this.slotMinusUI.setPosition(this.slotBetUI.x - (415 * this.slotBody.scaleX), canvasRef.value.offsetHeight - this.slotMinusUI.displayHeight - (50 * this.slotBody.scaleX));

                        this.slotSpinUI.setScale(2.25 * this.slotBody.scaleX, 2.25 * this.slotBody.scaleX);
                        this.slotSpinUI.setPosition(this.slotBalanceUI.x, canvasRef.value.offsetHeight - this.slotSpinUI.displayHeight - (350 * this.slotBody.scaleX));
                        this.slotSpinLabel.setFontSize(220 * this.slotBody.scaleX);
                        this.slotSpinLabel.setPosition(this.slotSpinUI.x, this.slotSpinUI.y + (68 * this.slotBody.scaleX));

                        this.slotAutoUI.setScale(1.75 * this.slotBody.scaleX, 1.75 * this.slotBody.scaleX);
                        this.slotAutoUI.setPosition(this.slotSpinUI.x - (660 * this.slotBody.scaleX), canvasRef.value.offsetHeight - this.slotAutoUI.displayHeight - (350 * this.slotBody.scaleX));
                        this.slotAutoLabel.setFontSize(80 * this.slotBody.scaleX);
                        this.slotAutoLabel.setPosition(this.slotAutoUI.x, this.slotAutoUI.y + (86 * this.slotBody.scaleX));

                        this.slotForwardUI.setScale(1.75 * this.slotBody.scaleX, 1.75 * this.slotBody.scaleX);
                        this.slotForwardUI.setPosition(this.slotSpinUI.x + (660 * this.slotBody.scaleX), canvasRef.value.offsetHeight - this.slotForwardUI.displayHeight - (350 * this.slotBody.scaleX));
                        this.slotForward.setScale(0.25 * this.slotBody.scaleX, 0.25 * this.slotBody.scaleX);
                        this.slotForward.setPosition(this.slotForwardUI.x, this.slotForwardUI.y + (148 * this.slotBody.scaleX));


                        this.freeSpinShadow.rotation = Phaser.Math.DegToRad(-90);
                        this.freeSpinShadow.setScale(7 * this.slotBody.scaleX, 7 * this.slotBody.scaleX);
                        this.freeSpinShadow.setPosition((canvasRef.value.offsetWidth / 2) - ((freeSpinHeight / 4) * 3) + (freeSpinWidth / 2), canvasRef.value.offsetHeight - (824 * this.slotBody.scaleX));

                        this.freeSpinLevel.rotation = Phaser.Math.DegToRad(-90);
                        this.freeSpinLevel.setScale(7 * this.slotBody.scaleX, 7 * this.slotBody.scaleX);
                        this.freeSpinLevel.scaleY = 0;
                        this.freeSpinLevel.setPosition(this.freeSpinShadow.x, this.freeSpinShadow.y);

                        this.freeSpinContainer.rotation = Phaser.Math.DegToRad(-90);
                        this.freeSpinContainer.setScale(7 * this.slotBody.scaleX, 7 * this.slotBody.scaleX);
                        this.freeSpinContainer.setPosition(this.freeSpinShadow.x, this.freeSpinShadow.y);

                        this.freeSpinLabel = this.add.text(this.slotSpinUI.x, this.slotSpinUI.y - (86 * this.slotBody.scaleX), 'free spin', { ...this.TEXT_STYLE, fontSize: 80 * this.slotBody.scaleX }).setOrigin(0.5, 0.5);

                        if (isIphone) this.freeSpinLabel.y -= (14 * this.slotBody.scaleX);
                    }



                    // Events control
                    let isGamePlayingWatch;

                    this.input.keyboard.on('keyup-ESC', () => isSettingOpened.value = false);

                    // play
                    this.input.keyboard.on('keydown-SPACE', () => {
                        if (isSettingOpened.value) return;
                        if (this.slotBet > this.slotBalance && this.freeSpinValue !== 100) return;
                        if (this.isAutoSpinActive) return;
                        this.spin();
                    });

                    this.slotSpinUI.setInteractive({ useHandCursor: true });
                    this.slotSpinUI.on('pointerdown', () => {
                        if (isSettingOpened.value) return;
                        if (this.slotBet > this.slotBalance && this.freeSpinValue !== 100) return;
                        if (this.isAutoSpinActive) return;
                        this.spin();
                    });

                    // autoplay
                    this.slotAutoUI.setInteractive({ useHandCursor: true });
                    this.slotAutoUI.on('pointerdown', () => {
                        if (isSettingOpened.value) return;
                        if (this.slotBet > this.slotBalance && this.freeSpinValue !== 100) return;

                        if (this.isAutoSpinActive) {
                            isGamePlayingWatch(); // watch stop => unwatch
                            this.isAutoSpinActive = false;
                            this.slotAutoUI.postPipelines = [];

                            if (isGamePlaying.value) {
                                this.slotSpinUI.setAlpha(0.5);
                                this.slotSpinUI.input.cursor = false;
                            } else {
                                this.slotSpinUI.setAlpha(1);
                                this.slotSpinUI.input.cursor = 'pointer';
                            }

                            return;
                        }

                        if (isGamePlaying.value) return;

                        this.isAutoSpinActive = true;
                        this.slotAutoUI.postFX.addGlow(0xbe0100, 10 * this.slotBody.scaleX, 0);
                        this.slotSpinUI.setAlpha(0.5);
                        this.slotSpinUI.input.cursor = false;
                        this.spin();

                        isGamePlayingWatch = watch(
                            () => isGamePlaying.value,
                            (val) => {
                                if (!val) {
                                    if (selectedCondition === 'lose' || selectedCondition === 'fake-win') {
                                        setTimeout(() => {
                                            if (!this.isAutoSpinActive) return;
                                            this.spin();
                                        }, ANIMATION_DURATION / 2);
                                    } else {
                                        setTimeout(() => {
                                            if (!this.isAutoSpinActive) return;
                                            this.spin();
                                        }, ANIMATION_DURATION);
                                    }
                                }
                            }
                        );
                    });

                    // play speed
                    this.slotForwardUI.setInteractive({ useHandCursor: true });
                    this.slotForwardUI.on('pointerdown', () => {
                        if (isSettingOpened.value) return;
                        this.isFastForwardActive = !this.isFastForwardActive;

                        if (this.isFastForwardActive) this.slotForwardUI.postFX.addGlow(0xbe0100, 10 * this.slotBody.scaleX, 0);
                        else this.slotForwardUI.postPipelines = [];
                    });

                    // bet handler
                    this.slotPlusUI.setInteractive({ useHandCursor: true });
                    this.slotMinusUI.setInteractive({ useHandCursor: true });

                    this.slotPlusUI.on('pointerdown', () => {
                        if (isSettingOpened.value) return;
                        if (this.freeSpinValue === 100) return;

                        this.slotBet += this.slotBetIncrement;
                        this.slotBetValue.setText(formatNumber(this.slotBet));

                        if (this.slotBet >= 1000) {
                            this.slotPlusUI.input.enabled = false;
                            this.slotPlusUI.setAlpha(0.5);
                            this.slotPlusUI.input.cursor = false;
                            this.input.setDefaultCursor('default');
                        } else {
                            this.slotMinusUI.input.enabled = true;
                            this.slotMinusUI.setAlpha(1);
                            this.slotMinusUI.input.cursor = 'pointer';
                        }
                    });
                    this.slotMinusUI.on('pointerdown', () => {
                        if (isSettingOpened.value) return;
                        if (this.freeSpinValue === 100) return;

                        this.slotBet -= this.slotBetIncrement;
                        this.slotBetValue.setText(formatNumber(this.slotBet));

                        if (this.slotBet <= 100) {
                            this.slotMinusUI.input.enabled = false;
                            this.slotMinusUI.setAlpha(0.5);
                            this.slotMinusUI.input.cursor = false;
                            this.input.setDefaultCursor('default');
                            return;
                        } else {
                            this.slotPlusUI.input.enabled = true;
                            this.slotPlusUI.setAlpha(1);
                            this.slotPlusUI.input.cursor = 'pointer';
                        }
                    });



                    // mega win screen
                    this.megaWinScreenOverlay = this.add.graphics();
                    this.megaWinScreenOverlay.fillStyle(0x000000, 0.5);
                    this.megaWinScreenOverlay.fillRect(0, 0, canvasRef.value.offsetWidth, canvasRef.value.offsetHeight);
                    this.megaWinScreenOverlay.setAlpha(0);

                    this.megaWinScreenText = this.add.image(0, 0, 'mega-win_text').setOrigin(0.5, 0.5);
                    this.megaWinScreenText.setScale(1 * this.slotBody.scaleX, 1 * this.slotBody.scaleX);
                    this.megaWinScreenText.setPosition(canvasRef.value.offsetWidth / 2, canvasRef.value.offsetHeight / 2);
                    this.megaWinScreenText.setAlpha(0);

                    this.megaWinScreenCoin = this.add.image(0, 0, 'mega-win_coin').setOrigin(0.5, 0.5);
                    this.megaWinScreenCoin.setScale(1 * this.slotBody.scaleX, 1 * this.slotBody.scaleX);
                    this.megaWinScreenCoin.setPosition(canvasRef.value.offsetWidth / 2, canvasRef.value.offsetHeight / 2);
                    this.megaWinScreenCoin.setAlpha(0);

                    for (let i = 0; i < 3; i++) {
                        let megaWinKey;
                        switch (i) {
                            case 0:
                                megaWinKey = 'megaWinScreenOverlay';
                                break;
                            case 1:
                                megaWinKey = 'megaWinScreenText';
                                break;
                            case 2:
                                megaWinKey = 'megaWinScreenCoin';
                        }

                        const megaWinTween = this.tweens.add({
                            targets: this[megaWinKey],
                            alpha: 1,
                            duration: 200,
                            ease: 'sine.inout',
                            paused: true,
                            persist: true
                        });
                        this.megaWinScreenAnimation[i] = megaWinTween;
                    }
                }



                /*update(time, delta) {
                    //
                }*/



                // CUSTOM FUNCTIONS
                generateReel(id, reelMap, xGap) {
                    const reel = [];
                    const elementsHeightWrap = [];
                    const maskDimension = {
                        width: 322 * this.slotBody.scaleX,
                        height: 322 * this.slotBody.scaleX * SYMBOL_X_REEL
                    }
                    const mask = this.add.graphics();

                    mask.fillStyle(0xff0000, 0); //////// DEBUG TOOL: 0 => 1

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

                    // Resize after sheet creation to render animation out of reel mask
                    mask.scaleX = 1.5;
                    mask.x -= 75 * this.slotBody.scaleX;

                    return verticalLoop(reel, maskDimension, elementsHeightWrap, {
                        repeat: -1,
                        paused: true,
                        center: true,
                    });
                }

                // Return To Player
                // Random Number Generator
                spin() {
                    if (isGamePlaying.value) return;

                    if (!this.isAutoSpinActive) {
                        this.slotSpinUI.setAlpha(0.5);
                        this.slotSpinUI.input.cursor = false;
                        this.input.setDefaultCursor('default');
                    }

                    isGamePlaying.value = true;
                    mixerAudio.slotClickFX.play();
                    if (this.freeSpinLabelAnimation) this.freeSpinLabelAnimation.destroy();

                    this.slotPlusUI.input.enabled = false;
                    this.slotPlusUI.setAlpha(0.5);
                    this.slotMinusUI.input.enabled = false;
                    this.slotMinusUI.setAlpha(0.5);

                    if (this.freeSpinValue !== 100) this.slotBalance -= this.slotBet; // If free spin is active can't reduce the balance
                    if (this.freeSpinValue === 100) this.lastBetBeforeFreeSpin = this.slotBet;

                    this.slotBalanceValue.setText(formatNumber(this.slotBalance));
                    this.slotWin = null;
                    this.slotWinValue.setText('');

                    if (randomWinSymbol) {
                        for (let i = 1; i <= REELS_X_SLOT; i++) {
                            if (jollyRandomReel && i === jollyRandomReel) {
                                reels[`reel${i}`][`${JOLLY}Sheet`].anims.stop();
                                reels[`reel${i}`][`${JOLLY}Sheet`].setFrame(`${JOLLY}-animation_30.png`);
                                reels[`reel${i}`][`${JOLLY}Sheet`].postPipelines = [];
                                jollyRandomReel = null;
                                continue;
                            }
                            reels[`reel${i}`][`${randomWinSymbol}Sheet`].anims.stop();
                            reels[`reel${i}`][`${randomWinSymbol}Sheet`].setFrame(`${randomWinSymbol}-animation_30.png`);
                            reels[`reel${i}`][`${randomWinSymbol}Sheet`].postPipelines = [];
                            this.symbolsAnimations[i].destroy();
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
                            indexReels = getRandomLose(indexReels, REELS_X_SLOT, [...SYMBOLS, MEGA_WIN, JOLLY], SLOT_MAP);
                            break
                        case 'fake-win':
                        case 'win':
                        case 'mega-win':
                            let symbolsWithoutJolly;
                            if (selectedCondition === 'fake-win') {
                                symbolsWithoutJolly = [...SYMBOLS, MEGA_WIN];
                                randomWinSymbol = symbolsWithoutJolly[getRandomNumber(0, symbolsWithoutJolly.length - 1)];
                            }
                            if (selectedCondition === 'win') randomWinSymbol = SYMBOLS[getRandomNumber(0, SYMBOLS.length - 1)];
                            if (selectedCondition === 'mega-win') randomWinSymbol = MEGA_WIN;

                            for (let i = 1; i <= REELS_X_SLOT; i++) {
                                indexReels[`indexReel${i}`] = SLOT_MAP[`REEL_${i}_MAP`].indexOf(randomWinSymbol);
                            }

                            if (selectedCondition === 'fake-win') {
                                indexReels = getRandomFakeWin(indexReels, REELS_X_SLOT, symbolsWithoutJolly, SLOT_MAP, randomWinSymbol);

                                randomWinSymbol = null;
                            }

                            if (selectedCondition !== 'fake-win') {
                                const jollyCondition = jollyWinRatio[getRandomNumber(0, jollyWinRatio.length -1)];

                                if (jollyCondition) {
                                    jollyRandomReel = getRandomNumber(1, REELS_X_SLOT);
                                    indexReels[`indexReel${jollyRandomReel}`] = SLOT_MAP[`REEL_${jollyRandomReel}_MAP`].indexOf(JOLLY);
                                }
                            }

                            indexReels = Object.assign(getRandomWinMap(indexReels)); // Map is always created at the end, for any selected condition
                    }

                    const animRevolutions = 20; // Increase this value for faster animations with same duration
                    const animDuration = 4;
                    let newAnimDuration = getRandomNumber(30, 50);
                    newAnimDuration = newAnimDuration / 10;
                    if (this.isFastForwardActive) newAnimDuration = newAnimDuration / 2; // Play speed x2
                    const newAnimRevolutions = Math.floor((animRevolutions / animDuration) * newAnimDuration); // Revolutions sync with animation duration

                    for (let i = 1; i <= REELS_X_SLOT; i++) {
                        let animDelay;
                        switch (i) {
                            case 1:
                                animDelay = 0;
                                break;
                            case 2:
                                animDelay = !this.isFastForwardActive ? 0.10 : 0.05;
                                break;
                            case 3:
                                animDelay = !this.isFastForwardActive ? 0.20 : 0.10;
                                break;
                            case 4:
                                animDelay = !this.isFastForwardActive ? 0.40 : 0.20;
                                break;
                            case 5:
                                animDelay = !this.isFastForwardActive ? 0.80 : 0.40;
                        }

                        const animConfig = { duration: parseFloat((newAnimDuration + animDelay).toFixed(2)), revolutions: newAnimRevolutions, ease: 'power2.inOut' };
                        animConfig.onComplete = () => {
                            mixerAudio.slotTickFX.play();
                            if (i === 5) this.onComplete();
                        }

                        slotAnimation[`reel${i}Animation`].toIndex(indexReels[`indexReel${i}`], animConfig);
                    }
                }

                onComplete() {
                    isGamePlaying.value = false;

                    const freeSpinWidth = 50 * this.slotBody.scaleX;
                    const freeSpinHeight = 800 * this.slotBody.scaleX;
                    const freeSpinBorder = 10 * this.slotBody.scaleX;

                    if (this.freeSpinValue === 100) {
                        this.freeSpinValue = 0;
                        this.freeSpinLabel.postPipelines = [];

                        this.characterDrink.visible = false;
                        this.characterDrink.anims.pause();
                        this.characterMain.visible = true;
                        this.characterMain.anims.play('character-main_animation');

                        if (this.freeSpinParticles) this.freeSpinParticles.destroy();

                        this.freeSpinLevelAnimation = this.tweens.add({
                            targets: this.freeSpinLevel,
                            y: !isMobile ? this.freeSpinLevel.y + freeSpinHeight : this.freeSpinLevel.y,
                            x: this.freeSpinLevel.x,
                            scaleY: 0,
                            duration: 200,
                            ease: 'sine.inout',
                            onComplete: () => {
                                this.freeSpinLevelAnimation.destroy();
                            }
                        });
                    } else {
                        this.freeSpinValue += this.freeSpinIncrement; // Every spin increase the free spin value when free spin is not active

                        this.freeSpinLevelAnimation = this.tweens.add({
                            targets: this.freeSpinLevel,
                            y: !isMobile ? this.freeSpinLevel.y - (freeSpinHeight * (this.freeSpinIncrement / 100)) : this.freeSpinLevel.y,
                            x: this.freeSpinLevel.x,
                            scaleY: !isMobile ? this.freeSpinValue / 100 : (this.freeSpinValue / 100) * (7 * this.slotBody.scaleX),
                            duration: 200,
                            ease: 'sine.inout',
                            onComplete: () => {
                                this.freeSpinLevelAnimation.destroy();

                                if (this.freeSpinParticles) this.freeSpinParticles.destroy();

                                if (!isMobile) {
                                    const particlesBounds = new Phaser.Geom.Rectangle(this.freeSpinContainer.x + (freeSpinBorder * 1.5), this.freeSpinContainer.y + (freeSpinBorder * 2) + freeSpinHeight - (freeSpinHeight * (this.freeSpinValue / 100)), freeSpinWidth - (freeSpinBorder * 3), freeSpinHeight * (this.freeSpinValue / 100) - (freeSpinBorder * 4));
                                    this.freeSpinParticles = this.add.particles(this.freeSpinContainer.x + (freeSpinWidth / 2), this.freeSpinContainer.y + freeSpinHeight - (freeSpinBorder * 2), 'freespin_bubble', {
                                        scale: { min: 0.1 * this.slotBody.scaleX, max: 0.25 * this.slotBody.scaleX },
                                        speed: { min: 5, max: 10 },
                                        alpha: { start: 0.5, end: 0 },
                                        lifespan: ANIMATION_DURATION * 3 * (this.freeSpinValue / 100),
                                        frequency: ANIMATION_DURATION / 2,
                                        gravityY: -100,
                                        particleBringToTop: false,
                                        bounds: particlesBounds
                                    });
                                }
                                if (isMobile) {
                                    const particlesBounds = new Phaser.Geom.Rectangle((canvasRef.value.offsetWidth / 2) - ((freeSpinHeight / 4) * 3) + (freeSpinWidth / 2) + (freeSpinBorder * 2), canvasRef.value.offsetHeight - (824 * this.slotBody.scaleX) - freeSpinWidth + (freeSpinBorder * 1.5), freeSpinHeight * (7 * this.slotBody.scaleX) * (this.freeSpinValue / 100) - (freeSpinBorder * 4.5), freeSpinWidth - (freeSpinBorder * 3));
                                    this.freeSpinParticles = this.add.particles((canvasRef.value.offsetWidth / 2) - ((freeSpinHeight / 4) * 3) + (freeSpinWidth / 2) + (freeSpinBorder * 2.5), canvasRef.value.offsetHeight - (824 * this.slotBody.scaleX) - (freeSpinWidth / 2) - freeSpinBorder, 'freespin_bubble', {
                                        scale: { min: 0.1 * this.slotBody.scaleX, max: 0.25 * this.slotBody.scaleX },
                                        speed: { min: 5, max: 10 },
                                        alpha: { start: 0.5, end: 0 },
                                        lifespan: ANIMATION_DURATION * 2.25 * (this.freeSpinValue / 100),
                                        frequency: ANIMATION_DURATION / 2,
                                        gravityX: 100,
                                        gravityY: -15,
                                        particleBringToTop: false,
                                        bounds: particlesBounds
                                    });
                                }
                            }
                        });
                    }

                    if (this.freeSpinValue === 100) {
                        const freeSpinFX = this.freeSpinLabel.postFX.addGlow(0xbe0100, 0, 0);

                        this.freeSpinLabelAnimation = this.tweens.add({
                            targets: freeSpinFX,
                            duration: ANIMATION_DURATION / 2, // Sync with sprite animation
                            outerStrength: 10 * this.slotBody.scaleX,
                            yoyo: true,
                            loop: -1,
                            ease: 'sine.inout'
                        });

                        mixerAudio.slotFreeSpinFX.play();
                        this.slotBetValue.setText('free');

                        this.characterMain.visible = false;
                        this.characterMain.anims.pause();
                        this.characterDrink.visible = true;
                        this.characterDrink.anims.play('character-drink_animation');
                    }


                    if (!this.isAutoSpinActive) {
                        this.slotSpinUI.setAlpha(1);
                        this.slotSpinUI.input.cursor = 'pointer';

                        this.slotPlusUI.input.enabled = 'pointer';
                        this.slotPlusUI.setAlpha(1);
                        this.slotMinusUI.input.enabled = 'pointer';
                        this.slotMinusUI.setAlpha(1);

                        if (
                            this.input.x >= this.slotSpinUI.x - (this.slotSpinUI.displayWidth / 2) &&
                            this.input.x <= this.slotSpinUI.x - (this.slotSpinUI.displayWidth / 2) + this.slotSpinUI.displayWidth &&
                            this.input.y >= this.slotSpinUI.y &&
                            this.input.y <= this.slotSpinUI.y + this.slotSpinUI.displayHeight
                        ) {
                            this.input.setDefaultCursor('pointer');
                            this.slotSpinUI.on('pointerout', () => this.input.setDefaultCursor('default'));
                        }
                    } 


                    if (!randomWinSymbol) {
                        if (this.freeSpinValue === 0) { // Free spin is used
                            this.slotBet = this.lastBetBeforeFreeSpin;
                            this.slotBetValue.setText(formatNumber(this.slotBet));
                        }

                        return;
                    }


                    for (let i = 1; i <= REELS_X_SLOT; i++) {
                        let symbolWinFX;
                        if (jollyRandomReel && i === jollyRandomReel) {
                            reels[`reel${i}`][`${JOLLY}Sheet`].anims.play(`reel${i}-${JOLLY}_animation`);
                            symbolWinFX = reels[`reel${i}`][`${JOLLY}Sheet`].postFX.addGlow(0xffffff, 0, 0);
                        } else {
                            reels[`reel${i}`][`${randomWinSymbol}Sheet`].anims.play(`reel${i}-${randomWinSymbol}_animation`);
                            symbolWinFX = reels[`reel${i}`][`${randomWinSymbol}Sheet`].postFX.addGlow(0xffffff, 0, 0);
                        }

                        this.symbolsAnimations[i] = this.tweens.add({
                            targets: symbolWinFX,
                            duration: ANIMATION_DURATION / 2, // Sync with sprite animation
                            outerStrength: 10 * this.slotBody.scaleX,
                            yoyo: true,
                            loop: -1,
                            ease: 'sine.inout'
                        });
                    }


                    if (this.freeSpinValue === 0) {
                        this.slotBet = this.slotBetIncrement; // Min bet x free spin
                    }


                    if (selectedCondition === 'mega-win') {
                        mixerAudio.slotMegaWinFX.play();
                        this.slotWin = this.slotBet * this.slotMegaWinMultiplier;

                        for (let i = 0; i < 3; i++) {
                            this.input.enabled = false;
                            this.input.keyboard.enabled = false;

                            let megaWinKey;
                            switch (i) {
                                case 0:
                                    megaWinKey = 'megaWinScreenOverlay';
                                    break;
                                case 1:
                                    megaWinKey = 'megaWinScreenText';
                                    break;
                                case 2:
                                    megaWinKey = 'megaWinScreenCoin';
                            }

                            this.megaWinScreenAnimation[i].play();

                            setTimeout(() => {
                                this[megaWinKey].setAlpha(0);

                                this.input.enabled = true;
                                this.input.keyboard.enabled = true;
                            }, !this.isFastForwardActive ? ANIMATION_DURATION * 2 : ANIMATION_DURATION);
                        }
                    }

                    else if (jollyRandomReel) {
                        mixerAudio.slotWinJollyFX.play(); // Not playing with mega win selected condition
                        this.slotWin = this.slotBet * this.slotWinJollyMultiplier;
                    } 

                    else if (selectedCondition === 'win') {
                        mixerAudio.slotWinFX.play(); // Not playing with jolly selected condition
                        this.slotWin = this.slotBet * this.slotWinMultiplier;
                    }


                    if (this.slotWin) this.slotBalance += this.slotWin; // Balance update when win

                    this.slotBalanceValue.setText(formatNumber(this.slotBalance));
                    this.slotWinValue.setText(formatNumber(this.slotWin));


                    if (this.freeSpinValue === 0) { // Free spin is used
                        this.slotBet = this.lastBetBeforeFreeSpin;
                        this.slotBetValue.setText(formatNumber(this.slotBet));
                    }
                }
            }



            // GAME CONFIG
            const config = {
                type: Phaser.WEBGL,
                width: window.innerWidth,
                height: window.innerHeight,
                canvas: canvasRef.value,
                transparent: true,
                scale: {
                    mode: Phaser.Scale.FIT,
                    autoCenter: !isIphone ? Phaser.Scale.CENTER_BOTH : Phaser.Scale.CENTER_HORIZONTALLY,
                }
            };

            const game = new Phaser.Game(config);

            game.scene.add('gameScene', GameScene);
            game.scene.start('gameScene');
        });

        onUnmounted(() => {
            if (wakeLock) wakeLock.release();
            if (mixerAudio.backgroundMusic) mixerAudio.backgroundMusic.pause();
            if (isMobile) exitFullScreen();
        });

        return {
            isLoadingScreenActive,
            loaderProgress,
            isLoadingComplete,
            isGameEntered,
            canvasRef,
            isMobile,
            isFullScreenActive,
            enterFullScreen,
            exitFullScreen,
            isSettingOpened,
            isVolumeActive,
            setVolume,
            isGamePlaying,
            SYMBOLS,
            assetsUrl
        };
    },
};
</script>


<style scoped>
@import url("@/assets/projects/slotmachine/css/slotmachine.css");
</style>
