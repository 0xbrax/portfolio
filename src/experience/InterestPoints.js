import * as THREE from "three";
import Experience from "@/experience/Experience.js";

export default class InterestPoints {
    constructor() {
        this.experienceInstance = new Experience();
        this.instanceGroup = new THREE.Group();
        this.experienceInstance.world.planet.instanceGroup.add(this.instanceGroup);



        this.INTEREST_POINTS = [
            {
                theta: 2.28,
                phi: 0.56
            },
            {
                theta: 0.75,
                phi: 1.32
            },
            {
                theta: 2.17,
                phi: 1.94
            }
        ];

        this.createPoints();
    }

    createPoints() {
        const geometry = new THREE.BoxGeometry(0.25, 0.25, 2);
        const material = new THREE.MeshBasicMaterial({ color:'red' });

        this.INTEREST_POINTS.forEach((point) => {
            const mesh = new THREE.Mesh(geometry, material);

            const theta = point.theta; // y angle
            const phi = point.phi;  // x angle

            const position = this.sphericalToCartesian(3 + 0.25, theta, phi);
            mesh.position.copy(position);
            mesh.lookAt(new THREE.Vector3(0, 0, 0));

            this.instanceGroup.add(mesh);
        });
    }

    sphericalToCartesian(radius, theta, phi) {
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        return new THREE.Vector3(x, y, z);
    }
}