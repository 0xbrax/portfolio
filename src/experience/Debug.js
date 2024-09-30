import Experience from "./Experience.js";
import GUI from 'lil-gui'
import * as THREE from "three";



export const DEBUG = (isActive = false) => {
    if (!isActive) {
        return;
    }

    const experienceInstance = new Experience();
    const DEBUG = new GUI();

    const rendererFolder = DEBUG.addFolder('renderer').close();



    rendererFolder.add(experienceInstance.config.renderer, 'toneMapping', {
        No: THREE.NoToneMapping,
        Linear: THREE.LinearToneMapping,
        Reinhard: THREE.ReinhardToneMapping,
        Cineon: THREE.CineonToneMapping,
        ACESFilmic: THREE.ACESFilmicToneMapping
    });
    rendererFolder.add(experienceInstance.config.renderer, 'toneMappingExposure').min(0).max(10).step(0.01);



    return DEBUG;
};
