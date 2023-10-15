<template>
    <div id="slot-machine">
        <canvas ref="canvasRef"></canvas>
    </div>
</template>

<script>
    import { ref, onMounted } from 'vue';
    import Phaser from 'phaser';

    import SlotBodyImage from '@/assets/projects/slotmachine/image/main/reel.png';
    import TestImage from '@/assets/projects/slotmachine/image/test/spritesheet.png';

    export default {
        name: 'SlotMachine',

        setup() {
            const canvasRef = ref(null);



            onMounted(() => {
                class GameScene extends Phaser.Scene {
                    constructor() {
                        super("GameScene");
                        this.image;
                        this.test;
                        this.testInitialY;
                    }

                    preload() {
                        this.image = this.load.image("slotBody", SlotBodyImage);
                        this.test = this.load.image('test', TestImage);
                    }

                    create() {
                        this.image = this.add.image(0, 0, "slotBody").setOrigin(0, 0);

                        const ratio = this.image.height / this.image.width;
                        this.image.displayWidth = canvasRef.value.offsetWidth * 50 / 100;
                        this.image.displayHeight = this.image.displayWidth * ratio;

                        this.image.setPosition((canvasRef.value.offsetWidth / 2) - (this.image.displayWidth / 2), (canvasRef.value.offsetHeight / 2) - (this.image.displayHeight / 2));




                        const mask = this.add.graphics();
                        mask.fillStyle(0xff0000, 1);
                        mask.fillRect(393, 127, 138, 437);

                        const imageX = 393 + (138 / 2);
                        const imageY = 0; //127 + (437 / 2);

                        console.log(imageY)

                        this.test = this.add.image(imageX, imageY, 'test');
                        this.test.setMask(mask.createGeometryMask());

                        this.testInitialY = this.test.y;
                    }

                    update() {
                        this.test.setY(this.test.y += 1);

                        if (this.test.y >= canvasRef.value.offsetHeight) {
                            this.test.y = this.testInitialY;
                        }


                        if (this.test.y > this.test.displayHeight - 127) {
                            //console.log('REPEAT') // OK
                        }
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
