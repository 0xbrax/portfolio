import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';

import PositivePopAudioTrack from "@/assets/audio/sfmusic_positive_pop.mp3";
import AirplaneIdleAudioFX from "@/assets/audio/airplane_idle_fx.mp3";

const STORE_NAME = 'settings';

export const useSettingsStore = defineStore(STORE_NAME, () => {
    // SETUP
    const defaultSettings = {
        backgroundMusic: '100',
        airplaneIdleFX: '50'
    }
    const getSettings = () => {
        const settings = localStorage.getItem(STORE_NAME);

        return settings ? JSON.parse(settings) : defaultSettings;
    }

    const audioArray = ["airplaneIdleFX", "backgroundMusic"];
    const audioObject = reactive({});

    audioArray.forEach((el) => {
        let audioSource;
        let audioVolume;
        let audioIcon;

        switch (el) {
            case "backgroundMusic":
                audioSource = PositivePopAudioTrack;
                audioVolume = getSettings()[el];
                audioIcon = "fas fa-music";
                break;
            case "airplaneIdleFX":
                audioSource = AirplaneIdleAudioFX;
                audioVolume = getSettings()[el];
                audioIcon = "fas fa-plane";
                break;
        }

        audioObject[el] = document.createElement("audio");
        audioObject[el].src = audioSource;
        audioObject[`${el}Level`] = ref(audioVolume);
        audioObject[`${el}Icon`] = audioIcon;
        audioObject[el].addEventListener("ended", () => {
            audioObject[el].currentTime = 0;
            audioObject[el].play();
        });
    });

    // STATE
    const audioLevels = reactive(getSettings());

    // ACTIONS
    const updateAudioLevel = (audio, level) => {
        audioLevels[audio] = level;

        localStorage.setItem(STORE_NAME, JSON.stringify(audioLevels));
    }

    // INIT
    localStorage.setItem(STORE_NAME, JSON.stringify(audioLevels));

    return { 
        audioObject, 
        updateAudioLevel
    }
});