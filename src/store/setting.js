import { defineStore } from "pinia";

export const useSettingStore = defineStore("settingStore", {
  state: () => ({
    experienceRef: null,
    isExperienceReady: false,
    loaderProgress: 0,
    worldSeed: null,
    isNewPlanetReady: true,
  }),
  actions: {
    generateNewPlanet(randomSeed) {
      this.isNewPlanetReady = false;
      this.worldSeed = randomSeed;
      this.experienceRef.world.planet.generateNewPlanet(randomSeed);
    }
  }
});
