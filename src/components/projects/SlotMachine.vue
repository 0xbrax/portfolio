<template>
    <div id="slot-machine">
        <canvas ref="canvasRef"></canvas>
    </div>
</template>

<script>
    import { ref, onMounted } from 'vue';
    import Phaser from 'phaser';
    import { gsap } from "gsap";

    import SlotBodyImage from '@/assets/projects/slotmachine/image/main/reel.png';
    import TestImage from '@/assets/projects/slotmachine/image/test/spritesheet.png';
    import TestImage1 from '@/assets/projects/slotmachine/image/test/apple.png';
    import TestImage2 from '@/assets/projects/slotmachine/image/test/arbuz.png';
    import TestImage3 from '@/assets/projects/slotmachine/image/test/cherry.png';
    import TestImage4 from '@/assets/projects/slotmachine/image/test/cocktail.png';
    import TestImage5 from '@/assets/projects/slotmachine/image/test/lemon.png';
    import TestImage6 from '@/assets/projects/slotmachine/image/test/nut.png';
    import TestImage7 from '@/assets/projects/slotmachine/image/test/straw.png';

    export default {
        name: 'SlotMachine',

        setup() {
            const canvasRef = ref(null);



            onMounted(() => {
                class GameScene extends Phaser.Scene {
                    constructor() {
                        super({ key: 'gameScene' });

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
                    }

                    preload() {
                        this.image = this.load.image("slotBody", SlotBodyImage);
                        this.test = this.load.image('test', TestImage);

                        this.test1 = this.load.image('test1', TestImage1);
                        this.test2 = this.load.image('test2', TestImage2);
                        this.test3 = this.load.image('test3', TestImage3);
                        this.test4 = this.load.image('test4', TestImage4);
                        this.test5 = this.load.image('test5', TestImage5);
                        this.test6 = this.load.image('test6', TestImage6);
                        this.tedt7 = this.load.image('test7', TestImage7);
                    }

                    create() {
                        this.image = this.add.image(0, 0, "slotBody").setOrigin(0, 0);

                        const ratio = this.image.height / this.image.width;
                        this.image.displayWidth = canvasRef.value.offsetWidth * 50 / 100;
                        this.image.displayHeight = this.image.displayWidth * ratio;

                        this.image.setPosition((canvasRef.value.offsetWidth / 2) - (this.image.displayWidth / 2), (canvasRef.value.offsetHeight / 2) - (this.image.displayHeight / 2));




                        this.imageGroup = this.add.group();
                        const mask = this.add.graphics();
                        mask.fillStyle(0xff0000, 1);
                        mask.fillRect(393, 127, 138, 437);




                        for (let i = 0; i < 7; i++) {
                            this[`test${i + 1}`] = this.add.image(393 + (138 / 2), 127 + (138 * i) + (138 / 2), `test${i + 1}`);
                            
                            this[`test${i + 1}`].displayWidth = 138;
                            this[`test${i + 1}`].displayHeight = 138;
                            this[`test${i + 1}`].setMask(mask.createGeometryMask());

                            const animation = gsap.to(this[`test${i + 1}`], {
                                duration: 3,
                                y: this[`test${i + 1}`].y + (138 * 2),
                                ease: "power2.inOut",
                                onUpdate: () => {
                                    const progress = animation.progress();
                                    console.log(progress)
                                }
                            }).play();
                        }
                    }

                    update() {
                        /*for (let i = 0; i < 7; i++) {
                            //this[`test${i + 1}`].setY(this[`test${i + 1}`].y += 5);

                            if (this[`test${i + 1}`].y > this.totalReelHeight + (138 / 2)) {
                                this[`test${i + 1}`].y = (127 + (138 / 2)) - 138;
                                console.log(i + 1, this[`test${i + 1}`].y)
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
                    scene: [GameScene]
                };

                const game = new Phaser.Game(config);

                // posso gestire piu scene, schermata loader switch scena, start

                console.log(game)
            });

            return {
                canvasRef
            }
        }
    }
</script>

<style scoped>
    #slot-machine {
        width: 100%;
        height: 100dvh;
        position: relative;
        overflow-y: hidden;
        background-image: url('@/assets/projects/slotmachine/image/main/back.png');
        background-repeat: no-repeat;
        background-position: right bottom;
        background-size: cover;
    }
    canvas {
        width: 100%;
        height: 100%;
    }
</style>
