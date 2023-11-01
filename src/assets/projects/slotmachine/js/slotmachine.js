import { getRandomNumber } from "@/assets/js/utils.js";
import { gsap } from "gsap";

export const verticalLoop = (items, reelContainer, elementsHeightWrap, config) => {
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
        startY = items[length - 1].y,
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
        index -= 2; // End gap => show selected index on middle row
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

export const getRandomWinMap = ({ indexReel1, indexReel2, indexReel3, indexReel4, indexReel5 }) => {
    // PAY TABLE => index reel is always in the middle row before win map
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

export const getRandomLose = (indexReels, reelsXSlot, symbols, slotMap) => {
    const obj = Object.assign(indexReels);

    for (let i = 1; i <= reelsXSlot; i++) {
        obj[`indexReel${i}`] = getRandomNumber(0, symbols.length - 1);
    }

    // Need to verify at least 2 random reels, starting from reel number 2
    const checkReelIndex1 = getRandomNumber(2, reelsXSlot);
    let checkReelIndex2;
    do checkReelIndex2 = getRandomNumber(2, reelsXSlot);
    while (checkReelIndex1 === checkReelIndex2);

    const getNewReelIndex = (id) => {
        const symbolReel1 = slotMap.REEL_1_MAP[obj.indexReel1];
        let randomNumber = getRandomNumber(0, symbols.length - 1);
        const whatSymbolIndexInReel = slotMap[`REEL_${id}_MAP`].indexOf(symbolReel1);
        let diffIndex = Math.abs(randomNumber - whatSymbolIndexInReel);

        // Get out of win map
        while (diffIndex <= 1) {
            randomNumber = getRandomNumber(0, symbols.length - 1);
            diffIndex = Math.abs(randomNumber - whatSymbolIndexInReel);
        }

        return randomNumber;
    }

    obj[`indexReel${checkReelIndex1}`] = getNewReelIndex(checkReelIndex1);
    obj[`indexReel${checkReelIndex2}`] = getNewReelIndex(checkReelIndex2);

    return obj;
}