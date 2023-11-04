
export const assetsUrl = (path) => {
    return new URL(`/src/assets/${path}`, import.meta.url).href;
}

export const isDeviceMobile = () => {
    return !window.matchMedia('screen and (min-width: 576px)').matches;
}

export const getRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const formatNumber = (number) => {
    if (number == null) return '';

    let num = number.toString();
    const length = 12; // includes formatted string

    num = num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (num.length > length) num = num.slice(0, length) + '...';

    return num;
}