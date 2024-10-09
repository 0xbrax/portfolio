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
    const interestPointFolder = DEBUG.addFolder('interestPoint').close();



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
    //createInterestPoint();



    return DEBUG;
};
