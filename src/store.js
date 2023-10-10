import { defineStore } from 'pinia';
import { reactive } from 'vue';

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
        audioLevels, 
        updateAudioLevel
    }
});