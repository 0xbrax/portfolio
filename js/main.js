const nicknameContainer = document.getElementById('nickname-container');
const nickname = document.getElementById('nickname');
const nameSender = document.getElementById('nickname-sender');
const bestScoreView = document.getElementById('best-score-view');

const gameContainer = document.getElementById('game');
let isGamePlaying = false;
const playBtn = document.getElementById('play-btn');
const resetBtn = document.getElementById('reset-btn');
const pikaAudioBtn = document.getElementById('pika-audio-btn');
const bgMusicBtn = document.getElementById('bg-music-btn');

let pikachuContainer = document.getElementById('pikachu-container');
let pikachu = document.getElementById('pikachu');
let cloudText = document.getElementById('cloud-text');
let isPikachuSuperSayan = false;
let superCar = document.getElementById('car');
let wheelLeft = document.getElementById('wheel-car-left');
let wheelRight = document.getElementById('wheel-car-right');
let carNos = document.getElementById('fire');
let isSuperCarActive = false;
const backMusic = new Audio('assets/audio/Vanze - Survive (feat. Neon Dreams) [NCS Release].mp3');
let isBGMusicPlaying = false;
const jumpSound = new Audio('assets/audio/arcade-8bit-jump-sfx.mp3');
const killSound = new Audio('assets/audio/mixkit-retro-game-over-1947-edit.mp3');
const bonusSound = new Audio('assets/audio/mixkit-fairy-arcade-sparkle-866-edit.mp3');
const carStart = new Audio('assets/audio/ferrari-laferrari-v12-sound-edit.mp3');
const carStop = new Audio('assets/audio/car-horn-sfx.mp3');
const superSayanSound = new Audio('assets/audio/pikachu-remix-supersayan-sfx.mp3');
const pikachuSound = new Audio('assets/audio/pikachu-pika-sfx.mp3');

const mcdonalds = document.getElementById('mcdonalds');
const burger = document.getElementById('burger');
let grillTime = 1.8;
let star = document.getElementById('star');
let liveBonus = undefined;
let bonusPoints = 1000;
let randomBonus = 5000;
let isCarGoingRight = false;
let isCarGoingLeft = false;

let score = document.getElementById('score');
let scoreCounter = 0;
let liveScore = undefined;
let record = document.getElementById('record');
let recordCounter = 0;
let liveRecord = [];
let worldRecord = document.getElementById('world-record');
const leaderboardID = 'cfqyXSB5PmTHj6UnnYS2';

let keyState = {};

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
    grillTime = randomNumberDec(1.1, 1.9);
    burger.style.animationDuration = grillTime + 's';
});
star.addEventListener('animationend', function() {
    star.style.display = 'none';
    star.classList.remove('to-the-moon');

    clearInterval(liveBonus);
    liveBonus = undefined;
    randomBonus = randomNumber(4, 9) * 1000;
});
pikachuContainer.addEventListener('animationend', function() {
    pikachuContainer.classList.remove('jump');
    jumpSound.pause();
    jumpSound.currentTime = 0;
});
killSound.addEventListener('ended', function() {
    killSound.pause();
    killSound.currentTime = 0;
});
bonusSound.addEventListener('ended', function() {
    bonusSound.pause();
    bonusSound.currentTime = 0;
});

score.innerHTML = `LOL score: <span class="fw-bold">${scoreCounter}</span>`;
record.innerHTML = `Local record: <span class="fw-bold">${recordCounter}</span> by <span class="fw-bold">${nickname.value}</span>`;

let isPikachuAlive = setInterval(function() {
    if (isGamePlaying == false && isCarGoingRight == false && isCarGoingLeft == false) {
        wheelLeft.style.animationPlayState = 'paused';
        wheelRight.style.animationPlayState = 'paused';
    } else if (isGamePlaying == true && isCarGoingLeft == false) {
        wheelLeft.style.animationPlayState = 'running';
        wheelRight.style.animationPlayState = 'running';
        wheelLeft.style.animationDirection = 'normal';
        wheelRight.style.animationDirection = 'normal';
    }

    carNos.style.display = 'none';
    if (isCarGoingRight == true) {
        wheelLeft.style.animationPlayState = 'running';
        wheelRight.style.animationPlayState = 'running';
        wheelLeft.style.animationDirection = 'normal';
        wheelRight.style.animationDirection = 'normal';
        carNos.style.display = 'block';
    } else if (isCarGoingLeft == true) {
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

    if (pikachuLeft <= (burgerLeft + 5) && pikachuRight <= (burgerRight + 30) && pikachuBottom <= 25) {
        isGamePlaying = false;
        isPikachuSuperSayan = false;
        isSuperCarActive = false;

        pikachu.src = 'assets/img/pikachu-run-static-3.png';
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

        killSound.play();

        jumpSound.pause();
        jumpSound.currentTime = 0;
        carStart.pause();
        carStart.currentTime = 0;
        carStop.pause();
        carStop.currentTime = 0;
        bonusSound.pause();
        bonusSound.currentTime = 0;
        superSayanSound.pause();
        superSayanSound.currentTime = 0;
        pikachuSound.pause();
        pikachuSound.currentTime = 0;

        clearInterval(liveScore);
        liveScore = undefined;
        clearInterval(liveBonus);
        liveBonus = undefined;

        recordStorage();
        setNewPlayerScore(leaderboardID, nickname.value, scoreCounter);

        //if (scoreCounter >= worldRecordCounter) {
            setTimeout(function() {
                getLeaderboard(leaderboardID);
            }, 1000);
        //}
    }

    if (liveBonus == undefined && isGamePlaying == true) {
        liveBonus = setInterval(function() {
            star.style.display = 'block';
            star.classList.add('to-the-moon');
        }, randomBonus);
    }

    let starLeft = parseInt(window.getComputedStyle(star).getPropertyValue('left'));
    let starRight = parseInt(window.getComputedStyle(star).getPropertyValue('right'));

    if (pikachuLeft <= (starLeft + 5) && pikachuRight <= (starRight + 30) && pikachuBottom >= 75) {
        star.style.display = 'none';
        star.classList.remove('to-the-moon');

        bonusSound.play();

        cloudText.style.display = 'block';
        setTimeout(function() {
            cloudText.style.display = 'none';
        }, 1000);

        scoreCounter = scoreCounter + bonusPoints;
        score.innerHTML = `LOL score: <span class="fw-bold">${scoreCounter}</span>`;
    }
}, 10);

getLeaderboard(leaderboardID);
let getWorldRecord = setInterval(function() {
    getLeaderboard(leaderboardID);
}, 10000);

function playGame() {
    if (pikachu.classList.contains('kill')) {
        return;
    }

    isGamePlaying = true;

    if (isPikachuSuperSayan == true) {
        if (isSuperCarActive == true) {
            pikachu.src = 'assets/img/pikachu-supersayan-no-run.gif';
        } else {
            pikachu.src = 'assets/img/pikachu-supersayan-run-new.gif';
        }
    } else {
        if (isSuperCarActive == true) {
            pikachu.src = 'assets/img/pikachu-run-static-2.png';
        } else {
            pikachu.src = 'assets/img/pikachu-run-new.gif';
        }
    }

    gameContainer.style.animationPlayState = 'running';

    mcdonalds.classList.add('takeaway');
    burger.classList.add('diet');
    burger.style.animationDuration = grillTime + 's';

    if (liveScore == undefined) {
        liveScore = setInterval(function() {
            scoreCounter = scoreCounter + 10;
            score.innerHTML = `LOL score: <span class="fw-bold">${scoreCounter}</span>`;
        }, 100);
    }

    if (liveBonus == undefined) {
        liveBonus = setInterval(function() {
            star.style.display = 'block';
            star.classList.add('to-the-moon');
        }, randomBonus);
    }
}

function resetGame() {
    isGamePlaying = false;
    isPikachuSuperSayan = false;
    isSuperCarActive = false;

    pikachu.src = 'assets/img/pikachu-run-static-2.png';
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
    superSayanSound.pause();
    superSayanSound.currentTime = 0;
    pikachuSound.pause();
    pikachuSound.currentTime = 0;

    clearInterval(liveScore);
    liveScore = undefined;
    clearInterval(liveBonus);
    liveBonus = undefined;
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

    if (!pikachu.classList.contains('kill') && pikachuRight > 152) {
        if (isSuperCarActive == true) {
            pikachuContainer.style.left = (pikachuLeft + 8) + 'px';
        } else {
            pikachuContainer.style.left = (pikachuLeft + 4) + 'px';
        }
    }
}

function goLeft() {
    let pikachuLeft = parseInt(window.getComputedStyle(pikachuContainer).getPropertyValue('left'));

    if (!pikachu.classList.contains('kill') && pikachuLeft > 24) {
        if (isSuperCarActive == true) {
            pikachuContainer.style.left = (pikachuLeft - 8) + 'px';
        } else {
            pikachuContainer.style.left = (pikachuLeft - 4) + 'px';
        }
    }
}

function getSuperSayan() {
    if (pikachu.classList.contains('kill')) {
        return;
    }

    if (isPikachuSuperSayan == true) {
        superSayanSound.pause();
        superSayanSound.currentTime = 0;

        pikachuSound.play();
    } else {
        pikachuSound.pause();
        pikachuSound.currentTime = 0;

        superSayanSound.play();
    }

    if (isGamePlaying == true) {
        if (isPikachuSuperSayan == true) {
            if (isSuperCarActive == true) {
                pikachu.src = 'assets/img/pikachu-run-static-2.png';
            } else {
                pikachu.src = 'assets/img/pikachu-run-new.gif';
            }
            isPikachuSuperSayan = false;
        } else {
            if (isSuperCarActive == true) {
                pikachu.src = 'assets/img/pikachu-supersayan-no-run.gif';
            } else {
                pikachu.src = 'assets/img/pikachu-supersayan-run-new.gif';
            }
            isPikachuSuperSayan = true;
        }
    } else {
        if (isPikachuSuperSayan == true) {
            if (isSuperCarActive == true) {
                pikachu.src = 'assets/img/pikachu-run-static-2.png';
            } else {
                pikachu.src = 'assets/img/pikachu-run-static-2.png';
            }
            isPikachuSuperSayan = false;
        } else {
            if (isSuperCarActive == true) {
                pikachu.src = 'assets/img/pikachu-supersayan-no-run.gif';
            } else {
                pikachu.src = 'assets/img/pikachu-supersayan-no-run.gif';
            }
            isPikachuSuperSayan = true;
        }
    }
}

function getSuperCar() {
    if (pikachu.classList.contains('kill')) {
        return;
    }

    if (isSuperCarActive == true) {
        carStart.pause();
        carStart.currentTime = 0;

        carStop.play();
    } else {
        carStop.pause();
        carStop.currentTime = 0;

        carStart.play();
    }

    if (isGamePlaying == true) {
        if (isPikachuSuperSayan == true) {
            if (isSuperCarActive == true) {
                pikachu.classList.remove('car-active');
                superCar.style.display = 'none';
                isSuperCarActive = false;

                pikachu.src = 'assets/img/pikachu-supersayan-run-new.gif';
            } else {
                pikachu.classList.add('car-active');
                superCar.style.display = 'block';
                isSuperCarActive = true;

                pikachu.src = 'assets/img/pikachu-supersayan-no-run.gif';
            }
        } else {
            if (isSuperCarActive == true) {
                pikachu.classList.remove('car-active');
                superCar.style.display = 'none';
                isSuperCarActive = false;

                pikachu.src = 'assets/img/pikachu-run-new.gif';
            } else {
                pikachu.classList.add('car-active');
                superCar.style.display = 'block';
                isSuperCarActive = true;

                pikachu.src = 'assets/img/pikachu-run-static-2.png';
            }
        }
    } else {
        if (isPikachuSuperSayan == true) {
            if (isSuperCarActive == true) {
                pikachu.classList.remove('car-active');
                superCar.style.display = 'none';
                isSuperCarActive = false;

                pikachu.src = 'assets/img/pikachu-supersayan-no-run.gif';
            } else {
                pikachu.classList.add('car-active');
                superCar.style.display = 'block';
                isSuperCarActive = true;

                pikachu.src = 'assets/img/pikachu-supersayan-no-run.gif';
            }
        } else {
            if (isSuperCarActive == true) {
                pikachu.classList.remove('car-active');
                superCar.style.display = 'none';
                isSuperCarActive = false;

                pikachu.src = 'assets/img/pikachu-run-static-2.png';
            } else {
                pikachu.classList.add('car-active');
                superCar.style.display = 'block';
                isSuperCarActive = true;

                pikachu.src = 'assets/img/pikachu-run-static-2.png';
            }
        }
    }
}

function setSfxVolume() {
    if (jumpSound.volume == 1) {
        jumpSound.volume = 0;
    } else {
        jumpSound.volume = 1;
    }

    if (killSound.volume == 1) {
        killSound.volume = 0;
    } else {
        killSound.volume = 1;
    }

    if (bonusSound.volume == 1) {
        bonusSound.volume = 0;
    } else {
        bonusSound.volume = 1;
    }

    if (carStart.volume == 1) {
        carStart.volume = 0;
    } else {
        carStart.volume = 1;
    }

    if (carStop.volume == 1) {
        carStop.volume = 0;
    } else {
        carStop.volume = 1;
    }

    if (superSayanSound.volume == 1) {
        superSayanSound.volume = 0;
    } else {
        superSayanSound.volume = 1;
    }

    if (pikachuSound.volume == 1) {
        pikachuSound.volume = 0;
    } else {
        pikachuSound.volume = 1;
    }
}

function setBackMusic() {
    if (isBGMusicPlaying == false) {
        backMusic.play();
        isBGMusicPlaying = true;
    } else {
        backMusic.pause();
        isBGMusicPlaying = false;
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
const mobileSuperSayan = document.getElementById('mobile-supersayan');
const mobileSuperCar = document.getElementById('mobile-supercar');
let mobileRightMove = undefined;
let mobileLeftMove = undefined;

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
    if (mobileRightMove == undefined) {
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
    if (mobileRightMove == undefined) {
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
    if (mobileLeftMove == undefined) {
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
    if (mobileLeftMove == undefined) {
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

mobileSuperSayan.addEventListener('touchstart', event => {
    event.preventDefault();
    getSuperSayan();
});
mobileSuperSayan.addEventListener('mousedown', event => {
    event.preventDefault();
    getSuperSayan();
});

mobileSuperCar.addEventListener('touchstart', event => {
    event.preventDefault();
    getSuperCar();
});
mobileSuperCar.addEventListener('mousedown', event => {
    event.preventDefault();
    getSuperCar();
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
    const response = await fetch(
        `https://us-central1-js-capstone-backend.cloudfunctions.net/api/games/${id}/scores`,
    );
    const dataText = await response.text();
    const parsedData = JSON.parse(dataText);

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
        if (realTimeWorldRecord[i] == undefined) {
            divScore.innerHTML = `0 by ---`;
        } else {
            divScore.innerHTML = `${realTimeWorldRecord[i].score} by ${realTimeWorldRecord[i].user.substring(0, 3)}`;
        }
    }
};



//////// NICKNAME REQUEST TO PLAY ////////

nameSender.addEventListener('click', function() {
    requestToPlay();
});

nickname.addEventListener('keyup', function(event) {
    if (event.key == 'Enter') {
        requestToPlay();
    }
});

function requestToPlay() {
    if (nickname.value.length == 0 || nickname.value.length > 3) {
        return
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
                    if (isGamePlaying == false) {
                        if(isPikachuSuperSayan == false && isSuperCarActive == false) {
                            resetGame();
                        } else {
                            pikachuContainer.style.left = 24 + 'px';
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
                    getSuperSayan()
                break;
        }
    });

    playBtn.addEventListener('click', playGame);

    mobileInstantPlay.addEventListener('touchstart', event => {
        event.preventDefault();
        if (isGamePlaying == false) {
            if(isPikachuSuperSayan == false && isSuperCarActive == false) {
                resetGame();
            } else {
                pikachuContainer.style.left = 24 + 'px';
            }
            playGame();
        }
    });
    mobileInstantPlay.addEventListener('mousedown', event => {
        event.preventDefault();
        if (isGamePlaying == false) {
            if(isPikachuSuperSayan == false && isSuperCarActive == false) {
                resetGame();
            } else {
                pikachuContainer.style.left = 24 + 'px';
            }
            playGame();
        }
    });
}



//////// PRELOAD PAGE ////////

let preloadPage = document.getElementById('preload-page');
window.addEventListener('load', function() {
    setTimeout(function() {
        preloadPage.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 1230);
});