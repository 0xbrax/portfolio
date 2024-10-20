import { ref } from 'vue';



const screenMediaQuery = window.matchMedia('screen and (min-width: 768px)');
export const $isMobile = ref(!screenMediaQuery.matches);
screenMediaQuery.addEventListener('change', () => {
    $isMobile.value = !screenMediaQuery.matches;
});



export const getPseudoRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
