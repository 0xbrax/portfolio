import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";

export const useSettingStore = defineStore("settingStore", {
  state: () => ({
    experienceRef: null,
    isExperienceReady: false,
    hasExperienceEntered: false,
    loaderProgress: 0,
    worldSeed: null,
    isNewPlanetReady: true,
    isFirstTimeVisit: useLocalStorage('setting-isFirstTimeVisit', true),
    isInfoModalNeeded: false,
    isAudioActive: useLocalStorage('setting-isAudioActive', true)
  }),
  actions: {
    generateNewPlanet(randomSeed) {
      this.isNewPlanetReady = false;
      this.worldSeed = randomSeed;
      this.experienceRef.world.planet.generateNewPlanet(randomSeed);
    }
  }
});
