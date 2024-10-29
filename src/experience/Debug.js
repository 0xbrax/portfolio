import Experience from "./Experience.js";
import GUI from 'lil-gui'
import * as THREE from "three";



export const DEBUG = () => {
    const experienceInstance = new Experience();
    const DEBUG = new GUI({ title: 'DEBUG', closeFolders: true });
    DEBUG.close();

    const rendererFolder = DEBUG.addFolder('renderer');
    const ambientLightFolder = DEBUG.addFolder('ambientLight');
    const directionaLightFolder_1 = DEBUG.addFolder('directionaLight_1');
    const directionaLightFolder_2 = DEBUG.addFolder('directionaLight_2');
    const planetFolder = DEBUG.addFolder('planet');



    experienceInstance.config.controls.enablePan = true;
    const axesHelper = new THREE.AxesHelper(10);
    axesHelper.position.x = 0.1;
    experienceInstance.config.scene.add(axesHelper);



    const raycasterHelper = new THREE.ArrowHelper(experienceInstance.world.robot.raycaster.ray.direction, experienceInstance.world.robot.raycaster.ray.origin, experienceInstance.world.robot.raycaster.far, '#ff0000');
    experienceInstance.config.scene.add(raycasterHelper);

    experienceInstance.world.robot.circlecaster.visible = true;
    experienceInstance.world.plane.orbit.visible = true;
    experienceInstance.world.clouds.orbit.visible = true;



    experienceInstance.config.renderer.setClearColor('#626262');
    rendererFolder.add(experienceInstance.config.renderer, 'toneMapping', {
        No: THREE.NoToneMapping,
        Linear: THREE.LinearToneMapping,
        Reinhard: THREE.ReinhardToneMapping,
        Cineon: THREE.CineonToneMapping,
        ACESFilmic: THREE.ACESFilmicToneMapping
    });
    rendererFolder.add(experienceInstance.config.renderer, 'toneMappingExposure').min(0).max(10).step(0.01);



    ambientLightFolder.add(experienceInstance.world.ambientLight, 'intensity').min(0).max(5).step(0.1);

    directionaLightFolder_1.add(experienceInstance.world.directionalLight_1, 'intensity').min(0).max(5).step(0.1);
    directionaLightFolder_1.add(experienceInstance.world.directionalLight_1.position, 'x').min(-10).max(10).step(1);
    directionaLightFolder_1.add(experienceInstance.world.directionalLight_1.position, 'y').min(-10).max(10).step(1);
    directionaLightFolder_1.add(experienceInstance.world.directionalLight_1.position, 'z').min(-10).max(10).step(1);
    const directionalLightHelper_1 = new THREE.DirectionalLightHelper(experienceInstance.world.directionalLight_1);
    experienceInstance.config.scene.add(directionalLightHelper_1);

    directionaLightFolder_2.add(experienceInstance.world.directionalLight_2, 'intensity').min(0).max(5).step(0.1);
    directionaLightFolder_2.add(experienceInstance.world.directionalLight_2.position, 'x').min(-10).max(10).step(1);
    directionaLightFolder_2.add(experienceInstance.world.directionalLight_2.position, 'y').min(-10).max(10).step(1);
    directionaLightFolder_2.add(experienceInstance.world.directionalLight_2.position, 'z').min(-10).max(10).step(1);
    const directionalLightHelper_2 = new THREE.DirectionalLightHelper(experienceInstance.world.directionalLight_2);
    experienceInstance.config.scene.add(directionalLightHelper_2);



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
