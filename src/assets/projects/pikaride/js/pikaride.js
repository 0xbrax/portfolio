import router from '@/router.js';
import backMusicFile from '@/assets/projects/pikaride/audio/Josh Mease - 4 on the Floor 8bit.wav';
/*import jumpSound = new Audio(`${__ASSETS_URL__}projects/pikaride/audio/arcade-8bit-jump-sfx.mp3`);
import killSound = new Audio(`${__ASSETS_URL__}projects/pikaride/audio/mixkit-retro-game-over-1947-edit.mp3`);
import bonusSound = new Audio(`${__ASSETS_URL__}projects/pikaride/audio/mixkit-fairy-arcade-sparkle-866-edit.mp3`);
import carStart = new Audio(`${__ASSETS_URL__}projects/pikaride/audio/ferrari-laferrari-v12-sound-edit.mp3`);
import carStop = new Audio(`${__ASSETS_URL__}projects/pikaride/audio/car-horn-sfx.mp3`);
import superSaiyanSound = new Audio(`${__ASSETS_URL__}projects/pikaride/audio/pikachu-remix-supersaiyan-sfx.mp3`);
import pikachuSound = new Audio(`${__ASSETS_URL__}projects/pikaride/audio/pikachu-pika-sfx.mp3`);*/

// MODULE START
export const pikarideModule = () => {



const nicknameContainer = document.getElementById('nickname-container');
let nickname = document.getElementById('nickname');
const nameSender = document.getElementById('nickname-sender');
const bestScoreView = document.getElementById('best-score-view');

const gameInfo = document.getElementById('game-info-container');
const gameInfoBtn = document.getElementById('game-info-btn');
const gameInfoHandle = document.getElementById('game-info-handle');

const gameContainer = document.getElementById('game');
let isGamePlaying = false;
const playBtn = document.getElementById('play-btn');
const resetBtn = document.getElementById('reset-btn');
const pikaAudioBtn = document.getElementById('pika-audio-btn');
const bgMusicBtn = document.getElementById('bg-music-btn');

let pikachuContainer = document.getElementById('pikachu-container');
let pikachu = document.getElementById('pikachu');
let cloudText = document.getElementById('cloud-text');
let isPikachuSuperSaiyan = false;
let superCar = document.getElementById('car');
let wheelLeft = document.getElementById('wheel-car-left');
let wheelRight = document.getElementById('wheel-car-right');
let carNos = document.getElementById('fire');
let isSuperCarActive = false;
const backMusic = new Audio(backMusicFile);
let isBGMusicPlaying = false;
const jumpSound = new Audio('@/assets/projects/pikaride/audio/arcade-8bit-jump-sfx.mp3');
const killSound = new Audio(`${__ASSETS_URL__}projects/pikaride/audio/mixkit-retro-game-over-1947-edit.mp3`);
const bonusSound = new Audio(`${__ASSETS_URL__}projects/pikaride/audio/mixkit-fairy-arcade-sparkle-866-edit.mp3`);
const carStart = new Audio(`${__ASSETS_URL__}projects/pikaride/audio/ferrari-laferrari-v12-sound-edit.mp3`);
const carStop = new Audio(`${__ASSETS_URL__}projects/pikaride/audio/car-horn-sfx.mp3`);
const superSaiyanSound = new Audio(`${__ASSETS_URL__}projects/pikaride/audio/pikachu-remix-supersaiyan-sfx.mp3`);
const pikachuSound = new Audio(`${__ASSETS_URL__}projects/pikaride/audio/pikachu-pika-sfx.mp3`);

const mcdonalds = document.getElementById('mcdonalds');
const burger = document.getElementById('burger');
let grillTime = 1.8;

let monster = document.getElementById('monster');
let liveMonster = undefined;
let randomMonster = 1600;
let monsterTime = 1.3;

let finalBossContainer = document.getElementById('final-boss-container');
let finalBossMoveTime = 2;
let finalBossSelected = 0;
let finalBossLife = document.getElementById('final-boss-life');
let finalBossLifeCounter = 6;
let finalBoss = document.getElementById('final-boss');
let fireBall = document.getElementById('fire-ball');
let liveFireBall = undefined;
let randomFireBall = 3600;
let fireBallTime = 1.3;
fireBall.style.display = 'none';

let finalBossControl = undefined;
let finalBossLifeControl = 0;

let lightBall = document.getElementById('lighting-ball');
lightBall.style.display = 'none';
let lightBallTime = null;

let star = document.getElementById('star');
let liveBonus = undefined;
let bonusPoints = 1000;
let randomBonus = 5000;

let isCarGoingRight = false;
let isCarGoingLeft = false;

const truckDoorContainer = document.getElementById('truck-door-container');
const truckDoorFront = document.getElementById('truck-door-front');
const truckDoorBack = document.getElementById('truck-door-back');
const pikaStatic = document.getElementById('pikachu-static');
const breakBtn = document.getElementById('pika-food-btn');
let isBreakActive = false;

const scoreContainer = document.getElementById('score-container');
let score = document.getElementById('score');
let scoreCounter = 0;
let liveScore = undefined;
let level = document.getElementById('level');
let levelCheck = 0;
let levelCounter = 1;
let levelState = null;
let record = document.getElementById('record');
let recordCounter = 0;
let liveRecord = [];
let worldRecord = document.getElementById('world-record');
const leaderboardID = 'cfqyXSB5PmTHj6UnnYS2';

const keyState = {};

//////// PAPER PLANE DRAW ////////

const paperPlane = document.getElementById('paper-plane');
const paths = document.querySelectorAll('.paper-plane-path');
paperPlane.style.display = 'none';

fillSvgPaths();
document.addEventListener('scroll', fillSvgPaths);

function fillSvgPaths(event) {
    if (event && paperPlane.style.display === 'none') {
        paperPlane.style.display = 'block';
    }

    const scrollPercentage = (document.documentElement.scrollTop + document.body.scrollTop) / (document.documentElement.scrollHeight - document.documentElement.clientHeight);

    for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        const pathLength = path.getTotalLength();

        path.style.strokeDasharray = pathLength;
        path.style.strokeDashoffset = pathLength;

        const drawLength = pathLength * scrollPercentage;

        path.style.strokeDashoffset = pathLength - drawLength;
    }
}

////////////////

//////// AUDIO VISUALIZER ////////

const visualizerContainer = document.querySelector(".visualizer-container");
visualizerContainer.innerHTML = '';
const musicBarsNumber = 16;

for (let i = 0; i < musicBarsNumber; i++ ) {
    const bar = document.createElement("div");
    bar.setAttribute("id", "bar" + i);

    // FIX style per Vue scoped
    bar.style.display = 'inline-block';
    bar.style.backgroundColor = 'white';
    bar.style.margin = '0 2px';
    bar.style.width = '10px';
    bar.style.height = '5px';
    ////

    visualizerContainer.appendChild(bar);
}

let ctx;
let analayzer;

backMusic.addEventListener('play', function() {

    if (!ctx) {
        ctx = new AudioContext();
        const audioSource = ctx.createMediaElementSource(backMusic);
        analayzer = ctx.createAnalyser();

        audioSource.connect(analayzer);
        audioSource.connect(ctx.destination);
    }

    const frequencyData = new Uint8Array(analayzer.frequencyBinCount);
    analayzer.getByteFrequencyData(frequencyData);

    function renderFrame() {
        analayzer.getByteFrequencyData(frequencyData);

        for (let i = 0; i < musicBarsNumber; i++ ) {
            const index = (i + 2) * 2;
            let freqDB = frequencyData[index];

            const bar = document.querySelector("#bar" + i);
            if (!bar) {
                continue;
            }

            const barHeight = Math.max(((freqDB / 5) > 50 ? 50 : (freqDB / 5)) || 5);
            bar.style.height = barHeight + "px";
        }

        window.requestAnimationFrame(renderFrame);
    }

    renderFrame();
});

////////////////

gameInfoBtn.addEventListener('click', function() {
    if (gameInfo.classList.contains('d-none')) {
        gameInfo.classList.remove('d-none');
    } else {
        gameInfo.classList.add('d-none');
    }
    gameInfo.classList.toggle('d-block');
});
gameInfoHandle.addEventListener('click', function() {
    if (isGamePlaying === true) {
        return;
    }
    if (gameInfo.classList.contains('d-none')) {
        gameInfo.classList.remove('d-none');
    } else {
        gameInfo.classList.add('d-none');
    }
    gameInfo.classList.toggle('d-block');
});

breakBtn.addEventListener('click', function() {
    pikaStatic.classList.toggle('pikachu-static-anim');

    if (pikaStatic.classList.contains('pikachu-static-anim')) {
        breakBtn.innerHTML = 'NO MORE BREAK';

        isBreakActive = true;

        truckDoorFront.classList.add('truck-door-anim');
        truckDoorBack.classList.add('truck-door-anim');
    } else {
        breakBtn.innerHTML = 'BREAK';

        isBreakActive = false;

        truckDoorFront.classList.remove('truck-door-anim');
        truckDoorBack.classList.remove('truck-door-anim');
    }
});
pikaStatic.addEventListener('animationend', function() {
    isBreakActive = false;

    truckDoorFront.classList.remove('truck-door-anim');
    truckDoorBack.classList.remove('truck-door-anim');
});
truckDoorContainer.addEventListener('mouseover', function() {
    if (isBreakActive === true) {
        return;
    }

    truckDoorFront.classList.add('truck-door-hover');
    truckDoorBack.classList.add('truck-door-hover');
});
truckDoorContainer.addEventListener('mouseleave', function() {
    if (isBreakActive === true) {
        return;
    }

    truckDoorFront.classList.remove('truck-door-hover');
    truckDoorBack.classList.remove('truck-door-hover');
});

resetBtn.addEventListener('click', resetGame);

pikaAudioBtn.addEventListener('click', setSfxVolume);
bgMusicBtn.addEventListener('click', setBackMusic);

backMusic.addEventListener('ended', function() {
    backMusic.play();
});

mcdonalds.addEventListener('animationend', function() {
    mcdonalds.classList.remove('takeaway');
});
burger.addEventListener('animationend', function() {
    burger.classList.remove('diet');
    
    void burger.offsetWidth;

    mcdonalds.classList.add('takeaway');
    burger.classList.add('diet');

    if (levelCheck >= 22) {
        grillTime = randomNumberDec(1.1, 1.7);
    } else {
        levelCheck++;
        grillTime = randomNumberDec(1.3, 2.1);
    }

    burger.style.animationDuration = grillTime + 's';
});

monster.addEventListener('animationend', function() {
    monster.classList.remove('attack');
    monster.src = `${__ASSETS_URL__}projects/pikaride/img/blue-monster-flying.gif`;

    clearInterval(liveMonster);

    levelCheck++;

    liveMonster = undefined;

    randomMonster = randomNumberDec(1.7, 2.3) * 1000;

    monsterTime = randomNumberDec(0.9, 1.6);
});

finalBossContainer.addEventListener('animationend', function() {
    finalBossContainer.classList.remove('boss-move');
    
    void finalBossContainer.offsetWidth;

    finalBossContainer.classList.add('boss-move');
    finalBossMoveTime = randomNumberDec(1, 3);
    finalBossContainer.style.animationDuration = finalBossMoveTime + 's';
});

fireBall.addEventListener('animationend', function() {
    fireBall.style.display = 'none';
    fireBall.classList.remove('boss-attack');

    clearInterval(liveFireBall);
    liveFireBall = undefined;
    randomFireBall = randomNumberDec(1.0, 1.6) * 1000;

    fireBallTime = randomNumberDec(1.0, 1.6);
});

star.addEventListener('animationend', function() {
    star.style.display = 'none';
    star.classList.remove('to-the-moon');

    clearInterval(liveBonus);
    liveBonus = undefined;

    if (levelCounter > 3) {
        randomBonus = randomNumber(2, 5) * 1000;
    } else {
        randomBonus = randomNumber(4, 9) * 1000;
    }
});

pikachuContainer.addEventListener('animationend', function() {
    pikachuContainer.classList.remove('jump');
    jumpSound.pause();
    jumpSound.currentTime = 0;
});

lightBall.addEventListener('animationend', function() {
    lightBall.classList.remove('pika-attack');
    lightBall.style.display = 'none';
    lightBall.src = `${__ASSETS_URL__}projects/pikaride/img/lighting-ball-pulse.gif`;
});

killSound.addEventListener('ended', function() {
    killSound.pause();
    killSound.currentTime = 0;
});
bonusSound.addEventListener('ended', function() {
    bonusSound.pause();
    bonusSound.currentTime = 0;
});

score.innerHTML = `Score: <span class="fw-bold">${scoreCounter}</span>`;
level.innerHTML = `Level: <span class="fw-bold">${levelCounter}</span>`;
record.innerHTML = `Local record: <span class="fw-bold">${recordCounter}</span> by <span class="fw-bold">---</span>`;
worldRecord.innerHTML = `World record: <span class="fw-bold">Loading...</span>`;
for (let i = 0; i < 5; i++) {
    let divScore = document.createElement('div');
    bestScoreView.append(divScore);
    divScore.innerHTML = `Loading...`;
}

let isPikachuAlive = setInterval(function() {
    if (isGamePlaying === false && isCarGoingRight === false && isCarGoingLeft === false) {
        wheelLeft.style.animationPlayState = 'paused';
        wheelRight.style.animationPlayState = 'paused';
    } else if (isGamePlaying === true && isCarGoingLeft === false) {
        wheelLeft.style.animationPlayState = 'running';
        wheelRight.style.animationPlayState = 'running';
        wheelLeft.style.animationDirection = 'normal';
        wheelRight.style.animationDirection = 'normal';
    }

    carNos.style.display = 'none';
    if (isCarGoingRight === true) {
        wheelLeft.style.animationPlayState = 'running';
        wheelRight.style.animationPlayState = 'running';
        wheelLeft.style.animationDirection = 'normal';
        wheelRight.style.animationDirection = 'normal';
        carNos.style.display = 'block';
    } else if (isCarGoingLeft === true) {
        wheelLeft.style.animationPlayState = 'running';
        wheelRight.style.animationPlayState = 'running';
        wheelLeft.style.animationDirection = 'reverse';
        wheelRight.style.animationDirection = 'reverse';
        carNos.style.display = 'block';
    }

    if (keyState['ArrowLeft']){
        isCarGoingLeft = true;
        goLeft(); //key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37
    } else {
        isCarGoingLeft = false;
    }
    if (keyState['ArrowRight']){
        isCarGoingRight = true;
        goRight(); //key: 'ArrowRight', code: 'ArrowRight', keyCode: 39
    } else {
        isCarGoingRight = false;
    }

    let pikachuBottom = parseInt(window.getComputedStyle(pikachuContainer).getPropertyValue('bottom'));
    let pikachuLeft = parseInt(window.getComputedStyle(pikachuContainer).getPropertyValue('left'));
    let pikachuRight = parseInt(window.getComputedStyle(pikachuContainer).getPropertyValue('right'));
    let burgerLeft = parseInt(window.getComputedStyle(burger).getPropertyValue('left'));
    let burgerRight = parseInt(window.getComputedStyle(burger).getPropertyValue('right'));
    let monsterLeft = parseInt(window.getComputedStyle(monster).getPropertyValue('left'));
    let monsterRight = parseInt(window.getComputedStyle(monster).getPropertyValue('right'));
    let fireBallRight = parseInt(window.getComputedStyle(fireBall).getPropertyValue('right'));
    let finalBossRight = parseInt(window.getComputedStyle(finalBossContainer).getPropertyValue('right'));
    let finalBossBottom = parseInt(window.getComputedStyle(finalBossContainer).getPropertyValue('bottom'));
    let lightBallRight = parseInt(window.getComputedStyle(lightBall).getPropertyValue('right'));
    let lightBallBottom = parseInt(window.getComputedStyle(lightBall).getPropertyValue('bottom'));

    if (pikachuLeft <= (burgerLeft + 5) && pikachuRight <= (burgerRight + 30) && pikachuBottom <= 51) {
        die();
    }

    if (pikachuLeft <= (monsterLeft + 30) && pikachuRight <= (monsterRight + 70) && pikachuBottom <= 51) {
        die();
    }

    if ((pikachuRight + 80) >= (fireBallRight + 80) && pikachuRight <= (fireBallRight + 80) && pikachuBottom <= 51) {
        die();
    }

    let starLeft = parseInt(window.getComputedStyle(star).getPropertyValue('left'));
    let starRight = parseInt(window.getComputedStyle(star).getPropertyValue('right'));

    if (liveBonus === undefined && isGamePlaying === true) {
        liveBonus = setInterval(function() {
            star.style.display = 'block';
            star.classList.add('to-the-moon');
        }, randomBonus);
    }

    if (!lightBall.classList.contains('pika-attack')) {
        lightBall.style.left = pikachuLeft + 90 + 'px';
        lightBall.style.bottom = pikachuBottom + 7 + 'px';
    }

    if (pikachuLeft <= (starLeft + 5) && pikachuRight <= (starRight + 30) && pikachuBottom >= 101) {
        star.style.display = 'none';
        star.classList.remove('to-the-moon');

        if (levelCounter === 3) {
            lightBall.style.display = 'block';
        }

        bonusSound.play();

        cloudText.style.display = 'block';
        setTimeout(function() {
            cloudText.style.display = 'none';
        }, 1000);

        scoreCounter = scoreCounter + bonusPoints;
        score.innerHTML = `LOL score: <span class="fw-bold">${scoreCounter}</span>`;
    }

    ///////////////////////////////////////////////////
    if (levelCheck >= 22) {
        ///// RESET /////
        if (levelState != 2) {
            return;
        }

        monster.style.display = 'none';
        finalBossContainer.style.display = 'none';
        //////////

        gameContainer.style.backgroundImage = `url(${__ASSETS_URL__}projects/pikaride/img/2D-city-back_2x_02-edit.png)`;
        scoreContainer.style.color = 'black';
        level.innerHTML = `Level: <span class="fw-bold">\u221e</span>`;

        mcdonalds.style.display = 'block';
        burger.style.display = 'block';

        levelState = 3;
    } else if (levelCheck === 21) {
        if (finalBossSelected === 2 && liveFireBall === undefined) {
            liveFireBall = setInterval(function() {
                finalBoss.src = `${__ASSETS_URL__}projects/pikaride/img/phoenix-idle_flaping.gif`;
                fireBall.style.display = 'block';

                let finalBossBottom = parseInt(window.getComputedStyle(finalBossContainer).getPropertyValue('bottom'));
                fireBall.style.bottom = (45 + finalBossBottom) + 'px';
                fireBall.classList.add('boss-attack');

                finalBossControl = setTimeout(function() {
                    finalBoss.src = `${__ASSETS_URL__}projects/pikaride/img/phoenix-idle_no_flaping.gif`;

                    finalBossSelected = 2;
                }, 890);

                fireBall.style.animationDuration = fireBallTime + 's';
            }, randomFireBall);

            finalBossSelected = 3;
        }

        if ((lightBallRight + 40) >= (finalBossRight + 20) && lightBallRight <= (finalBossRight + 20) && (lightBallBottom - 18) >= (finalBossBottom + 20) && (lightBallBottom + 8) <= (finalBossBottom + 110)) {
            lightBall.style.display = 'none';
            lightBall.classList.remove('pika-attack');
            lightBall.src = `${__ASSETS_URL__}projects/pikaride/img/lighting-ball-pulse.gif`;
            finalBossLifeControl = finalBossLifeControl + 16.66;
            finalBossLife.style.background = `linear-gradient(90deg, rgba(255, 0, 0, 1) ${finalBossLifeControl}%, rgba(173, 255, 47, 1) ${finalBossLifeControl}%)`;
            finalBossLifeCounter--;

            if (finalBossLifeCounter === 0) {
                finalBossSelected = 4;
                if (finalBossSelected != 4) {
                    return;
                }

                clearInterval(liveFireBall);
                liveFireBall = undefined;
                clearTimeout(finalBossControl);

                finalBoss.src = `${__ASSETS_URL__}projects/pikaride/img/phoenix-die_1800_ms.gif`;
                finalBossContainer.classList.remove('boss-move');

                setTimeout(function() {
                    finalBossContainer.style.display = 'none';
                    fireBall.style.display = 'none';
                    fireBall.classList.remove('boss-attack');
                    finalBossLife.style.display = 'none';

                    scoreCounter = scoreCounter + 5000;
                    score.innerHTML = `LOL score: <span class="fw-bold">${scoreCounter}</span>`;

                    levelCheck++;

                    levelCounter = 4;
                }, 1790);
            }

            finalBossSelected = 5;
        }

        ///// RESET /////
        if (levelState != 1) {
            return;
        }

        mcdonalds.style.display = 'none';
        burger.style.display = 'none';

        monster.style.display = 'none';
        //////////

        gameContainer.style.backgroundImage = `url(${__ASSETS_URL__}projects/pikaride/img/2D-city-back_2x_04-edit.png)`;
        scoreContainer.style.color = 'white';
        levelCounter = 3;
        level.innerHTML = `Level: <span class="fw-bold">${levelCounter}</span>`;

        if (finalBossSelected === 0) {
            finalBossLife.style.display = 'block';
            finalBossContainer.style.display = 'block';
            finalBoss.src = `${__ASSETS_URL__}projects/pikaride/img/phoenix-rise_1620_ms.gif`;

            finalBossSelected = 1;
        }
        if (finalBossSelected === 1) {
            setTimeout(function() {
                finalBoss.src = `${__ASSETS_URL__}projects/pikaride/img/phoenix-idle_no_flaping.gif`;
                finalBossContainer.classList.add('boss-move');
                finalBossContainer.style.animationDuration = finalBossMoveTime + 's';
            }, 1610);

            finalBossSelected = 2;
        }

        levelState = 2;
    } else if (levelCheck >= 11) {
        ///// RESET /////
        levelState = 0;
        if (levelState != 0) {
            return;
        }

        mcdonalds.style.display = 'none';
        burger.style.display = 'none';
        //////////

        gameContainer.style.backgroundImage = `url(${__ASSETS_URL__}projects/pikaride/img/2D-city-back_2x_03-edit.png)`;
        scoreContainer.style.color = 'white';
        levelCounter = 2;
        level.innerHTML = `Level: <span class="fw-bold">${levelCounter}</span>`;
        monster.style.display = 'block';
        if (liveMonster === undefined && isGamePlaying === true) {
            liveMonster = setInterval(function() {
                monster.src = `${__ASSETS_URL__}projects/pikaride/img/blue-monster-flying-snapping.gif`;
                monster.classList.add('attack');

                monster.style.animationDuration = monsterTime + 's';
            }, randomMonster);
        }

        levelState = 1;
    }
}, 10);

getLeaderboard(leaderboardID);
let getWorldRecord = setInterval(function() {
    getLeaderboard(leaderboardID);
}, 120_000);

function playGame() {
    if (pikachu.classList.contains('kill')) {
        return;
    }

    disableScroll();
    disableResize();

    levelCounter = 1;
    gameContainer.style.backgroundImage = `url(${__ASSETS_URL__}projects/pikaride/img/2D-city-back_2x_01-edit.png)`;
    scoreContainer.style.color = 'black';
    level.innerHTML = `Level: <span class="fw-bold">${levelCounter}</span>`;

    pikachuContainer.style.left = 24 + 'px';
    isGamePlaying = true;

    if (isPikachuSuperSaiyan === true) {
        if (isSuperCarActive === true) {
            pikachu.src = `${__ASSETS_URL__}projects/pikaride/img/pikachu-supersaiyan-no-run.gif`;
        } else {
            pikachu.src = `${__ASSETS_URL__}projects/pikaride/img/pikachu-supersaiyan-run-new.gif`;
        }
    } else {
        if (isSuperCarActive === true) {
            pikachu.src = `${__ASSETS_URL__}projects/pikaride/img/pikachu-run-static-2.png`;
        } else {
            pikachu.src = `${__ASSETS_URL__}projects/pikaride/img/pikachu-run-new.gif`;
        }
    }

    gameContainer.style.animationPlayState = 'running';
    levelCheck++;

    mcdonalds.classList.add('takeaway');
    burger.classList.add('diet');
    burger.style.animationDuration = grillTime + 's';

    if (liveScore === undefined) {
        liveScore = setInterval(function() {
            scoreCounter = scoreCounter + 10;
            score.innerHTML = `LOL score: <span class="fw-bold">${scoreCounter}</span>`;
        }, 100);
    }

    if (liveBonus === undefined) {
        liveBonus = setInterval(function() {
            star.style.display = 'block';
            star.classList.add('to-the-moon');
        }, randomBonus);
    }

    grillTime = 1.8;

    randomMonster = 1600;
    monsterTime = 1.3;

    finalBossMoveTime = 2;
    finalBossSelected = 0;
    finalBossLifeCounter = 6;
    finalBossLifeControl = 0;
    finalBossLife.style.background = `linear-gradient(90deg, rgba(255, 0, 0, 1) ${finalBossLifeControl}%, rgba(173, 255, 47, 1) ${finalBossLifeControl}%)`;

    randomFireBall = 3600;
    fireBallTime = 1.3;

    randomBonus = 5000;
}

function resetGame() {
    isGamePlaying = false;
    isPikachuSuperSaiyan = false;
    isSuperCarActive = false;

    levelCheck = 0;
    levelCounter = 1;
    gameContainer.style.backgroundImage = `url(${__ASSETS_URL__}projects/pikaride/img/2D-city-back_2x_01-edit.png)`;
    scoreContainer.style.color = 'black';
    level.innerHTML = `Level: <span class="fw-bold">${levelCounter}</span>`;

    pikachu.src = `${__ASSETS_URL__}projects/pikaride/img/pikachu-run-static-2.png`;
    pikachuContainer.classList.remove('jump');
    pikachu.classList.remove('kill');
    pikachu.classList.remove('car-active');
    superCar.style.display = 'none';
    burger.classList.remove('diet');
    star.style.display = 'none';
    star.classList.remove('to-the-moon');
    cloudText.style.display = 'none';
    mcdonalds.classList.remove('takeaway');
    gameContainer.style.animationPlayState = 'paused';
    pikachuContainer.style.left = 24 + 'px';

    monster.src = `${__ASSETS_URL__}projects/pikaride/img/blue-monster-flying.gif`;
    monster.style.display = 'none';
    monster.classList.remove('attack');

    clearInterval(liveMonster);
    liveMonster = undefined;

    lightBall.style.display = 'none';
    lightBall.classList.remove('pika-attack');
    lightBall.src = `${__ASSETS_URL__}projects/pikaride/img/lighting-ball-pulse.gif`;

    finalBossContainer.style.display = 'none';
    finalBossContainer.classList.remove('boss-move');

    fireBall.style.display = 'none';
    fireBall.classList.remove('boss-attack');
    finalBossLife.style.display = 'none';

    clearInterval(liveFireBall);
    liveFireBall = undefined;
    clearTimeout(finalBossControl);

    mcdonalds.style.display = 'block';
    burger.style.display = 'block';

    scoreContainer.style.color = 'black';
    scoreCounter = 0;
    score.innerHTML = `LOL score: <span class="fw-bold">${scoreCounter}</span>`;

    jumpSound.pause();
    jumpSound.currentTime = 0;
    carStart.pause();
    carStart.currentTime = 0;
    carStop.pause();
    carStop.currentTime = 0;
    bonusSound.pause();
    bonusSound.currentTime = 0;
    killSound.pause();
    killSound.currentTime = 0;
    superSaiyanSound.pause();
    superSaiyanSound.currentTime = 0;
    pikachuSound.pause();
    pikachuSound.currentTime = 0;

    clearInterval(liveScore);
    liveScore = undefined;
    clearInterval(liveBonus);
    liveBonus = undefined;
}

function die() {
    enableScroll();
    enableResize();

    isGamePlaying = false;
    isPikachuSuperSaiyan = false;
    isSuperCarActive = false;

    pikachu.src = `${__ASSETS_URL__}projects/pikaride/img/pikachu-run-static-3.png`;
    pikachuContainer.classList.remove('jump');
    pikachu.classList.add('kill');
    pikachu.classList.remove('car-active');
    superCar.style.display = 'none';
    mcdonalds.classList.remove('takeaway');
    burger.classList.remove('diet');
    star.style.display = 'none';
    star.classList.remove('to-the-moon');
    cloudText.style.display = 'none';
    gameContainer.style.animationPlayState = 'paused';

    monster.src = `${__ASSETS_URL__}projects/pikaride/img/blue-monster-flying.gif`;
    monster.classList.remove('attack');

    clearInterval(liveMonster);
    liveMonster = undefined;

    if (!lightBall.classList.contains('pika-attack')) {
        lightBall.style.display = 'none';
    }

    fireBall.style.display = 'none';
    fireBall.classList.remove('boss-attack');

    clearInterval(liveFireBall);
    liveFireBall = undefined;
    clearTimeout(finalBossControl);

    finalBoss.src = `${__ASSETS_URL__}projects/pikaride/img/phoenix-idle_no_flaping.gif`;
    finalBossSelected = 3;

    killSound.play();

    jumpSound.pause();
    jumpSound.currentTime = 0;
    carStart.pause();
    carStart.currentTime = 0;
    carStop.pause();
    carStop.currentTime = 0;
    bonusSound.pause();
    bonusSound.currentTime = 0;
    superSaiyanSound.pause();
    superSaiyanSound.currentTime = 0;
    pikachuSound.pause();
    pikachuSound.currentTime = 0;

    clearInterval(liveScore);
    liveScore = undefined;
    clearInterval(liveBonus);
    liveBonus = undefined;

    recordStorage();
    setNewPlayerScore(leaderboardID, nickname.value, scoreCounter);

    setTimeout(function() {
        getLeaderboard(leaderboardID);
    }, 1000);
}

function jump() {
    if (!pikachu.classList.contains('kill')) {
        pikachuContainer.classList.add('jump');
        jumpSound.play()
    }
}

function goRight() {
    let pikachuLeft = parseInt(window.getComputedStyle(pikachuContainer).getPropertyValue('left'));
    let pikachuRight = parseInt(window.getComputedStyle(pikachuContainer).getPropertyValue('right'));

    if (!pikachu.classList.contains('kill') && pikachuRight > 168) {
        if (isSuperCarActive === true) {
            pikachuContainer.style.left = (pikachuLeft + 6) + 'px';
        } else {
            pikachuContainer.style.left = (pikachuLeft + 4) + 'px';
        }
    }
}

function goLeft() {
    let pikachuLeft = parseInt(window.getComputedStyle(pikachuContainer).getPropertyValue('left'));

    if (!pikachu.classList.contains('kill') && pikachuLeft > 24) {
        if (isSuperCarActive === true) {
            pikachuContainer.style.left = (pikachuLeft - 6) + 'px';
        } else {
            pikachuContainer.style.left = (pikachuLeft - 4) + 'px';
        }
    }
}

function getSuperSaiyan() {
    if (pikachu.classList.contains('kill')) {
        return;
    }

    if (isPikachuSuperSaiyan === true) {
        superSaiyanSound.pause();
        superSaiyanSound.currentTime = 0;

        pikachuSound.play();
    } else {
        pikachuSound.pause();
        pikachuSound.currentTime = 0;

        superSaiyanSound.play();
    }

    if (isGamePlaying === true) {
        if (isPikachuSuperSaiyan === true) {
            if (isSuperCarActive === true) {
                pikachu.src = `${__ASSETS_URL__}projects/pikaride/img/pikachu-run-static-2.png`;
            } else {
                pikachu.src = `${__ASSETS_URL__}projects/pikaride/img/pikachu-run-new.gif`;
            }
            isPikachuSuperSaiyan = false;
        } else {
            if (isSuperCarActive === true) {
                pikachu.src = `${__ASSETS_URL__}projects/pikaride/img/pikachu-supersaiyan-no-run.gif`;
            } else {
                pikachu.src = `${__ASSETS_URL__}projects/pikaride/img/pikachu-supersaiyan-run-new.gif`;
            }
            isPikachuSuperSaiyan = true;
        }
    } else {
        if (isPikachuSuperSaiyan === true) {
            pikachu.src = `${__ASSETS_URL__}projects/pikaride/img/pikachu-run-static-2.png`;
            isPikachuSuperSaiyan = false;
        } else {
            pikachu.src = `${__ASSETS_URL__}projects/pikaride/img/pikachu-supersaiyan-no-run.gif`;
            isPikachuSuperSaiyan = true;
        }
    }
}

function getSuperCar() {
    if (pikachu.classList.contains('kill')) {
        return;
    }

    if (isSuperCarActive === true) {
        carStart.pause();
        carStart.currentTime = 0;

        carStop.play();
    } else {
        carStop.pause();
        carStop.currentTime = 0;

        carStart.play();
    }

    if (isGamePlaying === true) {
        if (isPikachuSuperSaiyan === true) {
            if (isSuperCarActive === true) {
                pikachu.classList.remove('car-active');
                superCar.style.display = 'none';
                isSuperCarActive = false;

                pikachu.src = `${__ASSETS_URL__}projects/pikaride/img/pikachu-supersaiyan-run-new.gif`;
            } else {
                pikachu.classList.add('car-active');
                superCar.style.display = 'block';
                isSuperCarActive = true;

                pikachu.src = `${__ASSETS_URL__}projects/pikaride/img/pikachu-supersaiyan-no-run.gif`;
            }
        } else {
            if (isSuperCarActive === true) {
                pikachu.classList.remove('car-active');
                superCar.style.display = 'none';
                isSuperCarActive = false;

                pikachu.src = `${__ASSETS_URL__}projects/pikaride/img/pikachu-run-new.gif`;
            } else {
                pikachu.classList.add('car-active');
                superCar.style.display = 'block';
                isSuperCarActive = true;

                pikachu.src = `${__ASSETS_URL__}projects/pikaride/img/pikachu-run-static-2.png`;
            }
        }
    } else {
        if (isPikachuSuperSaiyan === true) {
            if (isSuperCarActive === true) {
                pikachu.classList.remove('car-active');
                superCar.style.display = 'none';
                isSuperCarActive = false;

                pikachu.src = `${__ASSETS_URL__}projects/pikaride/img/pikachu-supersaiyan-no-run.gif`;
            } else {
                pikachu.classList.add('car-active');
                superCar.style.display = 'block';
                isSuperCarActive = true;

                pikachu.src = `${__ASSETS_URL__}projects/pikaride/img/pikachu-supersaiyan-no-run.gif`;
            }
        } else {
            if (isSuperCarActive === true) {
                pikachu.classList.remove('car-active');
                superCar.style.display = 'none';
                isSuperCarActive = false;

                pikachu.src = `${__ASSETS_URL__}projects/pikaride/img/pikachu-run-static-2.png`;
            } else {
                pikachu.classList.add('car-active');
                superCar.style.display = 'block';
                isSuperCarActive = true;

                pikachu.src = `${__ASSETS_URL__}projects/pikaride/img/pikachu-run-static-2.png`;
            }
        }
    }
}

function pikaAttack() {
    if (lightBall.style.display === 'none') {
        return;
    }

    if (finalBossSelected === 2 || finalBossSelected === 3) {
        let pikachuRight = parseInt(window.getComputedStyle(pikachuContainer).getPropertyValue('right'));

        lightBall.src = `${__ASSETS_URL__}projects/pikaride/img/lighting-ball-rotating.gif`;
        lightBall.classList.add('pika-attack');
        lightBall.style.animationDuration = (pikachuRight / 350) + 's';
    }
}

function setSfxVolume() {
    if (jumpSound.volume === 1) {
        jumpSound.volume = 0;
    } else {
        jumpSound.volume = 1;
    }

    if (killSound.volume === 1) {
        killSound.volume = 0;
    } else {
        killSound.volume = 1;
    }

    if (bonusSound.volume === 1) {
        bonusSound.volume = 0;
    } else {
        bonusSound.volume = 1;
    }

    if (carStart.volume === 1) {
        carStart.volume = 0;
    } else {
        carStart.volume = 1;
    }

    if (carStop.volume === 1) {
        carStop.volume = 0;
    } else {
        carStop.volume = 1;
    }

    if (superSaiyanSound.volume === 1) {
        superSaiyanSound.volume = 0;
    } else {
        superSaiyanSound.volume = 1;
    }

    if (pikachuSound.volume === 1) {
        pikachuSound.volume = 0;
    } else {
        pikachuSound.volume = 1;
    }
}

function setBackMusic() {
    if (isBGMusicPlaying === false) {
        backMusic.play();
        isBGMusicPlaying = true;
        backMusic.volume = 1;
    } else {
        backMusic.pause();
        isBGMusicPlaying = false;
        backMusic.volume = 0;
    }
}

function recordStorage() {
    liveRecord.push(scoreCounter);

    if (liveRecord.length > 0) {
        for (let i = 0; i < liveRecord.length; i++) {
            if (liveRecord[i] > recordCounter) {
                recordCounter = liveRecord[i];
                record.innerHTML = `Local record: <span class="fw-bold">${recordCounter}</span> by <span class="fw-bold">${nickname.value}</span>`;
            }
        }
    }
}

function randomNumber(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function randomNumberDec(min, max) {
    return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}



//////// MOBILE BUTTON ////////

const mobileInstantPlay = document.getElementById('mobile-instant-play');
const mobileJump = document.getElementById('mobile-jump');
const mobileLeft = document.getElementById('mobile-left');
const mobileRight = document.getElementById('mobile-right');
const mobileSuperSaiyan = document.getElementById('mobile-supersaiyan');
const mobileSuperCar = document.getElementById('mobile-supercar');
let mobileRightMove = undefined;
let mobileLeftMove = undefined;
const mobileAttack = document.getElementById('mobile-attack');

mobileJump.addEventListener('touchstart', event => {
    event.preventDefault();
    jump();
});
mobileJump.addEventListener('mousedown', event => {
    event.preventDefault();
    jump();
});

mobileRight.addEventListener('touchstart', event => {
    event.preventDefault();
    if (mobileRightMove === undefined) {
        mobileRightMove = setInterval(function() {
            goRight();
            isCarGoingRight = true;
        }, 10);
    }
});
mobileRight.addEventListener('touchend', event => {
    event.preventDefault();
    clearInterval(mobileRightMove);
    mobileRightMove = undefined;
    isCarGoingRight = false;
});
mobileRight.addEventListener('mousedown', event => {
    event.preventDefault();
    if (mobileRightMove === undefined) {
        mobileRightMove = setInterval(function() {
            goRight();
            isCarGoingRight = true;
        }, 10);
    }
});
mobileRight.addEventListener('mouseup', event => {
    event.preventDefault();
    clearInterval(mobileRightMove);
    mobileRightMove = undefined;
    isCarGoingRight = false;
});

mobileLeft.addEventListener('touchstart', event => {
    event.preventDefault();
    if (mobileLeftMove === undefined) {
        mobileLeftMove = setInterval(function() {
            goLeft();
            isCarGoingLeft = true;
        }, 10);
    }
});
mobileLeft.addEventListener('touchend', event => {
    event.preventDefault();
    clearInterval(mobileLeftMove);
    mobileLeftMove = undefined;
    isCarGoingLeft = false;
});
mobileLeft.addEventListener('mousedown', event => {
    event.preventDefault();
    if (mobileLeftMove === undefined) {
        mobileLeftMove = setInterval(function() {
            goLeft();
            isCarGoingLeft = true;
        }, 10);
    }
});
mobileLeft.addEventListener('mouseup', event => {
    event.preventDefault();
    clearInterval(mobileLeftMove);
    mobileLeftMove = undefined;
    isCarGoingLeft = false;
});

mobileSuperSaiyan.addEventListener('touchstart', event => {
    event.preventDefault();
    getSuperSaiyan();
});
mobileSuperSaiyan.addEventListener('mousedown', event => {
    event.preventDefault();
    getSuperSaiyan();
});

mobileSuperCar.addEventListener('touchstart', event => {
    event.preventDefault();
    getSuperCar();
});
mobileSuperCar.addEventListener('mousedown', event => {
    event.preventDefault();
    getSuperCar();
});

mobileAttack.addEventListener('touchstart', event => {
    event.preventDefault();
    pikaAttack();
});
mobileAttack.addEventListener('mousedown', event => {
    event.preventDefault();
    pikaAttack();
});



//////// LEADERBOARD ////////

function setNewPlayerScore(id, player, score) {
    fetch(
        `https://us-central1-js-capstone-backend.cloudfunctions.net/api/games/${id}/scores`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user: player,
                score: score,
            }),
        },
    );
};
async function getLeaderboard(id) {
    let parsedData;
    try {
        const response = await fetch(
            `https://us-central1-js-capstone-backend.cloudfunctions.net/api/games/${id}/scores`,
        );
        const dataText = await response.text();

        parsedData = JSON.parse(dataText);
    } catch {
        bestScoreView.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            let divScore = document.createElement('div');
            bestScoreView.append(divScore);
            divScore.innerHTML = `0 by ---`;
        }
        worldRecord.innerHTML = `World record: <span class="fw-bold">0</span> by <span class="fw-bold">---</span>`;
        return;
    }

    let realTimeWorldRecord = parsedData.result;
    let worldRecordCounter = 0;

    if (realTimeWorldRecord.length > 0) {
        for (let i = 0; i < realTimeWorldRecord.length; i++) {
            if (realTimeWorldRecord[i].score > worldRecordCounter) {
                worldRecordCounter = realTimeWorldRecord[i].score;

                worldRecord.innerHTML = `World record: <span class="fw-bold">${worldRecordCounter}</span> by <span class="fw-bold">${realTimeWorldRecord[i].user.substring(0, 3)}</span>`;
            }
        }
    } else {
        worldRecord.innerHTML = `World record: <span class="fw-bold">0</span> by <span class="fw-bold">---</span>`;
    }

    realTimeWorldRecord.sort((a, b) => (b.score) - a.score);
    bestScoreView.innerHTML = '';

    for (let i = 0; i < 5; i++) {
        let divScore = document.createElement('div');
        bestScoreView.append(divScore);
        if (realTimeWorldRecord[i] === undefined) {
            divScore.innerHTML = `0 by ---`;
        } else {
            divScore.innerHTML = `${realTimeWorldRecord[i].score} - ${realTimeWorldRecord[i].user.substring(0, 3)}`;
        }
    }
};



//////// NICKNAME REQUEST TO PLAY ////////

nameSender.addEventListener('click', function() {
    requestToPlay();
});

nickname.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        requestToPlay();
    }
});

function requestToPlay() {
    const nickCheck = nickname.value.toString().trim();
    if (nickCheck === '' || nickCheck.length === 0 || nickCheck.length > 3) {
        return
    }

    if (backMusic.volume === 1) {
        backMusic.play();
        isBGMusicPlaying = true;
    }

    nicknameContainer.style.display = 'none';
    record.innerHTML = `Local record: <span class="fw-bold">${recordCounter}</span> by <span class="fw-bold">${nickname.value}</span>`;

    window.document.querySelector('body').addEventListener('keydown', function(event) {
        event.preventDefault();
        keyState[event.key] = true;
    }, true);
    window.document.querySelector('body').addEventListener('keyup', function(event) {
        event.preventDefault();
        keyState[event.key] = false;
    }, true);

    window.document.querySelector('body').addEventListener('keydown', function(event) {
        switch (event.key) {
            case 'Enter': //key: 'Enter', code: 'Enter', keyCode: 13
                    event.preventDefault();
                    if (isGamePlaying === false) {
                        if(isPikachuSuperSaiyan === false && isSuperCarActive === false) {
                            resetGame();
                        }
                        playGame();
                    }
                break;
            case ' ': //key: ' ', code: 'Space', keyCode: 32
                    event.preventDefault();
                    jump();
                break;
            case 'ArrowUp': //key: 'ArrowUp', code: 'ArrowUp', keyCode: 38
                    event.preventDefault();
                    getSuperCar();
                break;
            case 'ArrowDown': //key: 'ArrowDown', code: 'ArrowDown', keyCode: 40
                    event.preventDefault();
                    getSuperSaiyan()
                break;
            case 'e': //key: 'e', code: 'KeyE', keyCode: 69
            case 'E': //key: 'E', code: 'KeyE', keyCode: 69
            case 'y': //key: 'y', code: 'KeyY', keyCode: 89
            case 'Y': //key: 'Y', code: 'KeyY', keyCode: 89
                    event.preventDefault();
                    pikaAttack();
                break;
        }
    });

    playBtn.addEventListener('click', playGame);

    mobileInstantPlay.addEventListener('touchstart', event => {
        event.preventDefault();
        if (isGamePlaying === false) {
            if(isPikachuSuperSaiyan === false && isSuperCarActive === false) {
                resetGame();
            }
            playGame();
        }
    });
    mobileInstantPlay.addEventListener('mousedown', event => {
        event.preventDefault();
        if (isGamePlaying === false) {
            if(isPikachuSuperSaiyan === false && isSuperCarActive === false) {
                resetGame();
            }
            playGame();
        }
    });
}



// UPGRADE
function disableScroll() {
    document.body.style.overflow = 'hidden';
}
function enableScroll() {
    document.body.style.overflow = 'auto';
}
function disableResize() {
    window.addEventListener('resize', () => window.resizeTo(window.innerWidth, window.innerHeight));
}
function enableResize() {
    window.removeEventListener('resize', () => window.resizeTo(window.innerWidth, window.innerHeight));
}



// GO BACK BTN
const goBackBtn = document.getElementById('go-back-btn');
goBackBtn.addEventListener('click', () => {
    backMusic.pause();
    backMusic.currentTime = 0;

    router.push('/');
});

// MODULE END
}