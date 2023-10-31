export const getRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const isDeviceMobile = () => {
    return !window.matchMedia('screen and (min-width: 576px)').matches;
}