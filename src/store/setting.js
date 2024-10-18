import { defineStore } from "pinia";

export const useSettingStore = defineStore("settingStore", {
  state: () => ({
    isExperienceReady: false,
    loaderProgress: 0,
    worldSeed: null,
    audioVolumes: {},
  }),
});
