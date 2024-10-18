import Experience from "./Experience.js";
import GUI from 'lil-gui'
import * as THREE from "three";



export const DEBUG = () => {
    const experienceInstance = new Experience();
    const DEBUG = new GUI({ title: 'DEBUG', closeFolders: true });

    const rendererFolder = DEBUG.addFolder('renderer');
    const planetFolder = DEBUG.addFolder('planet');



    rendererFolder.add(experienceInstance.config.renderer, 'toneMapping', {
        No: THREE.NoToneMapping,
        Linear: THREE.LinearToneMapping,
        Reinhard: THREE.ReinhardToneMapping,
        Cineon: THREE.CineonToneMapping,
        ACESFilmic: THREE.ACESFilmicToneMapping
    });
    rendererFolder.add(experienceInstance.config.renderer, 'toneMappingExposure').min(0).max(10).step(0.01);

    const directionalLightHelper = new THREE.DirectionalLightHelper(experienceInstance.world.directionalLight);
    experienceInstance.config.scene.add(directionalLightHelper);

    const raycasterHelper = new THREE.ArrowHelper(experienceInstance.world.robot.raycaster.ray.direction, experienceInstance.world.robot.raycaster.ray.origin, experienceInstance.world.robot.raycaster.far, '#00ff00');
    experienceInstance.config.scene.add(raycasterHelper);

    experienceInstance.world.robot.circlecaster.visible = true;
    experienceInstance.world.plane.orbit.visible = true;



    planetFolder.addColor(experienceInstance.world.planet.debugObject, 'colorWaterDeep').onChange(() => experienceInstance.world.planet.model.material.uniforms.uColorWaterDeep.value.set(experienceInstance.world.planet.debugObject.colorWaterDeep));
    planetFolder.addColor(experienceInstance.world.planet.debugObject, 'colorWaterSurface').onChange(() => {
        experienceInstance.world.planet.model.material.uniforms.uColorWaterSurface.value.set(experienceInstance.world.planet.debugObject.colorWaterSurface);
        experienceInstance.world.planet.subModel.material.uniforms.uColorWaterSurface.value.set(experienceInstance.world.planet.debugObject.colorWaterSurface);
    });
    planetFolder.addColor(experienceInstance.world.planet.debugObject, 'colorWaterFoam').onChange(experienceInstance.world.planet.subModel.material.uniforms.uColorWaterFoam.value.set(experienceInstance.world.planet.debugObject.colorWaterFoam));
    planetFolder.addColor(experienceInstance.world.planet.debugObject, 'colorSand').onChange(() => experienceInstance.world.planet.model.material.uniforms.uColorSand.value.set(experienceInstance.world.planet.debugObject.colorSand));
    planetFolder.addColor(experienceInstance.world.planet.debugObject, 'colorGrass').onChange(() => experienceInstance.world.planet.model.material.uniforms.uColorGrass.value.set(experienceInstance.world.planet.debugObject.colorGrass));
    planetFolder.addColor(experienceInstance.world.planet.debugObject, 'colorSnow').onChange(() => experienceInstance.world.planet.model.material.uniforms.uColorSnow.value.set(experienceInstance.world.planet.debugObject.colorSnow));
    planetFolder.addColor(experienceInstance.world.planet.debugObject, 'colorRock').onChange(() => experienceInstance.world.planet.model.material.uniforms.uColorRock.value.set(experienceInstance.world.planet.debugObject.colorRock));



    return DEBUG;
};
