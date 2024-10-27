import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { getPseudoRandomInt } from "@/assets/utils.js";

export const useSettingStore = defineStore("settingStore", {
  state: () => ({
    experienceRef: null,
    isExperienceReady: false,
    hasExperienceEntered: false,
    loaderProgress: 0,
    worldSeed: null,
    isNewPlanetReady: true,
    isFirstTimeVisit: useLocalStorage('setting-isFirstTimeVisit', true),
    isAudioActive: useLocalStorage('setting-isAudioActive', true)
  }),
  actions: {
    generateNewPlanet(randomSeed = null) {
      let seed = randomSeed;

      if (seed == null) seed = getPseudoRandomInt(-1000, 1000);

      this.isNewPlanetReady = false;
      this.worldSeed = seed;
      this.experienceRef.generateNewPlanet(seed);
    }
  }
});
