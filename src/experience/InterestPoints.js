import * as THREE from "three";
import Experience from "@/experience/Experience.js";
import { TextGeometry } from "three/addons";

export default class InterestPoints {
    constructor() {
        this.experienceInstance = new Experience();
        this.instanceGroup = new THREE.Group();
        this.experienceInstance.world.planet.instanceGroup.add(this.instanceGroup);



        this.INTEREST_POINTS = [
            {
                theta: 2.28,
                phi: 0.56,
                text: `Fruit Cocktail`
            },
            {
                theta: 0.75,
                phi: 1.32,
                text: `NoK.Army`
            },
            {
                theta: 2.17,
                phi: 1.94,
                text: `Pika Ride`
            }
        ];

        this.createPoints();
    }

    createPoints() {
        const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2.5, 12);
        poleGeometry.rotateX(Math.PI * -0.5);
        const poleMaterial = new THREE.MeshStandardMaterial({
            color: '#c56c16'
        });

        const plateBodyGeometry = this.roundedBoxGeometry();
        const plateBodyMaterial = new THREE.MeshStandardMaterial({
            color: '#c59316'
        });

        const plateTextGeometry = new THREE.PlaneGeometry(1, 0.7, 16, 8);

        const pixelsPerUnit = 256;



        this.INTEREST_POINTS.forEach((el) => {
            const pointGroup = new THREE.Group();
            const pole = new THREE.Mesh(poleGeometry, poleMaterial);

            const plateGroup = new THREE.Group();
            const plateBody = new THREE.Mesh(plateBodyGeometry, plateBodyMaterial);
            plateBody.scale.set(1.5, 2.2, 1);

            const plateTextMaterial = new THREE.MeshStandardMaterial();
            const texture = this.createTextTexture(el.text, 1 * pixelsPerUnit, 1 * pixelsPerUnit);
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.generateMipmaps = false;
            texture.minFilter = THREE.NearestFilter;
            texture.magFilter = THREE.NearestFilter;
            plateTextMaterial.map = texture;
            plateTextMaterial.transparent = true;

            const plateText = new THREE.Mesh(plateTextGeometry, plateTextMaterial);
            plateText.position.y = 1.355;
            plateText.position.z = 0.03 + 0.001; // 0.001 --> z-fighting prevent



            const theta = el.theta; // y angle
            const phi = el.phi;  // x angle
            const pointPosition = this.sphericalToCartesian(3 + 0.25, theta, phi);
            pointGroup.position.copy(pointPosition);
            pointGroup.lookAt(new THREE.Vector3(0, 0, 0));

            plateGroup.rotation.x = Math.PI * -0.5;
            plateGroup.position.y = 0.08;
            plateGroup.position.z = 0.46;

            plateGroup.add(plateBody, plateText);
            pointGroup.add(pole, plateGroup);
            this.instanceGroup.add(pointGroup);
        });
    }

    sphericalToCartesian(radius, theta, phi) {
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        return new THREE.Vector3(x, y, z);
    }

    createTextTexture(text, width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        const fontSize = 48;
        ctx.font = `bold ${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const textLineHeight = fontSize * 1.2;
        const totalHeight = this.calculateTextHeight(ctx, text, width, textLineHeight);
        const yOffset = (canvas.height - totalHeight) / 2;

        this.wrapText(ctx, text, canvas.width / 2, yOffset, canvas.width, textLineHeight);

        return new THREE.CanvasTexture(canvas);
    }
    calculateTextHeight(ctx, text, maxWidth, textLineHeight) {
        const words = text.split(' ');
        let line = '';
        let lineCount = 1;

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i];
            const metrics = ctx.measureText(testLine + ' ');
            const testWidth = metrics.width;

            if (testWidth > maxWidth && i > 0) {
                line = words[i] + ' ';
                lineCount++;
            } else {
                line = testLine + ' ';
            }
        }

        return lineCount * textLineHeight;
    }
    wrapText(ctx, text, x, y, maxWidth, textLineHeight) {
        const words = text.split(' ');
        let line = '';

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i];
            const metrics = ctx.measureText(testLine + ' ');
            const testWidth = metrics.width;

            if (testWidth > maxWidth && i > 0) {
                ctx.fillText(line.trim(), x, y);
                line = words[i] + ' ';
                y += textLineHeight;
            } else {
                line = testLine + ' ';
            }
        }

        ctx.fillText(line.trim(), x, y);
    }

    roundedBoxGeometry() {
        const bevelSize = 0.02;
        const bevelThickness = 0.02;

        const geometry = new TextGeometry('-', {
            font: this.experienceInstance.assets.fonts.regular,
            size: 2,
            depth: 0.02,
            curveSegments: 1,
            bevelEnabled: true,
            bevelThickness: bevelThickness,
            bevelSize: bevelSize,
            bevelSegments: 4
        });

        geometry.computeBoundingBox();
        const boundingBox = geometry.boundingBox;
        const size = boundingBox.getSize(new THREE.Vector3());

        const offsetX = (size.x - bevelSize * 0.5) / 2;
        const offsetY = (size.y - bevelSize * 0.5) / 2;
        const offsetZ = (size.z - bevelThickness * 2) / 2;
        geometry.translate(-offsetX, -offsetY, -offsetZ);

        return geometry;

        ////////
        // DEBUG
        /*const material = new THREE.MeshStandardMaterial({
            color: '#ff0000',
            //wireframe: true
        });
        const textMesh = new THREE.Mesh(geometry, material);

        textMesh.position.x = 0;
        textMesh.position.y = 3;

        this.experienceInstance.world.planet.instanceGroup.add(textMesh);*/
    }
}