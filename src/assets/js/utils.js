export const getRandomNumber = (min, max) => {
    return Math.random() * (max - min) + min;
}

export const isDeviceMobile = () => {
    return !window.matchMedia('screen and (min-width:576px)').matches;
}