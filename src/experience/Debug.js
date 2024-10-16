import Experience from "./Experience.js";
import GUI from 'lil-gui'
import * as THREE from "three";



export const DEBUG = () => {
    const experienceInstance = new Experience();
    const DEBUG = new GUI({ title: 'DEBUG', closeFolders: true });

    const rendererFolder = DEBUG.addFolder('renderer');
    const planetFolder = DEBUG.addFolder('planet');
    const interestPointFolder = DEBUG.addFolder('interestPoint');



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



    const createInterestPoint = () => {
        const sphericalToCartesian = (radius, theta, phi) => {
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.cos(phi);
            const z = radius * Math.sin(phi) * Math.sin(theta);

            return new THREE.Vector3(x, y, z);
        };

        const point = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshBasicMaterial({ color: '#00ff00' })
        );
        experienceInstance.world.interestPoints.instanceGroup.add(point);

        const positions = {
            theta: Math.random() * Math.PI * 2, // y angle
            phi: Math.random() * Math.PI // x angle
        };
        const setPointPosition = () => {
            const position = sphericalToCartesian(3 + 0.5, positions.theta, positions.phi);
            point.position.copy(position);
            point.lookAt(new THREE.Vector3(0, experienceInstance.world.planet.instanceGroup.position.y, 0));
        };
        setPointPosition();

        interestPointFolder.add(positions, 'theta').min(0).max(Math.PI * 2).step(0.01).onChange(setPointPosition);
        interestPointFolder.add(positions, 'phi').min(0).max(Math.PI).step(0.01).onChange(setPointPosition);
    };
    createInterestPoint();



    return DEBUG;
};
