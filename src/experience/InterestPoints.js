import * as THREE from "three";
import Experience from "@/experience/Experience.js";

export default class InterestPoints {
    constructor(selectedPoints) {
        this.experienceInstance = new Experience();
        this.instanceGroup = new THREE.Group();
        this.experienceInstance.world.planet.instanceGroup.add(this.instanceGroup);

        this.interestPoints = this.experienceInstance.interestPoints;
        this.selectedPoints = selectedPoints;

        this.createPoints(this.selectedPoints);
    }

    createPoints(selectedPoints) {
        const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 12);
        poleGeometry.rotateX(Math.PI * -0.5);
        const poleMaterial = new THREE.MeshStandardMaterial({
            color: '#c56c16'
        });

        const plateBodyGeometry = this.roundedBoxGeometry();
        const plateBodyMaterial = new THREE.MeshStandardMaterial({
            color: '#c59316'
        });

        const plateTextGeometry = new THREE.PlaneGeometry(1, 0.7, 1, 1);
        const pixelsPerUnit = 256;

        this.interestPoints.forEach((el, i) => {
            const pointGroup = new THREE.Group();
            this.setSphericalPosition(pointGroup, selectedPoints[i]);

            const pole = new THREE.Mesh(poleGeometry, poleMaterial);
            pole.position.z = -0.5;

            const plateGroup = new THREE.Group();
            const plateBody = new THREE.Mesh(plateBodyGeometry, plateBodyMaterial);
            plateBody.rotation.z = Math.PI * -0.5;

            const plateTextMaterial = new THREE.MeshStandardMaterial();
            const texture = this.createTextTexture(el.title, 1 * pixelsPerUnit, 1 * pixelsPerUnit);
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.generateMipmaps = false;
            texture.minFilter = THREE.NearestFilter;
            texture.magFilter = THREE.NearestFilter;
            plateTextMaterial.map = texture;
            plateTextMaterial.transparent = true;

            const plateText = new THREE.Mesh(plateTextGeometry, plateTextMaterial);
            plateText.position.z = 0.025 + 0.001; // 0.001 --> z-fighting prevent

            plateGroup.rotation.x = Math.PI * -0.5;
            plateGroup.position.y = 0.075;
            plateGroup.position.z = -0.88;

            plateGroup.add(plateBody, plateText);
            pointGroup.cProps = { ...el };
            pointGroup.add(pole, plateGroup);
            this.instanceGroup.add(pointGroup);
        });
    }

    setSphericalPosition(object, selectedPoint) {
        const position = new THREE.Vector3(...Object.values(selectedPoint));
        object.position.copy(position);

        const direction = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), position).normalize();
        const up = new THREE.Vector3(0, 0, 1);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
        object.quaternion.copy(quaternion);

        const angleZ = Math.random() * Math.PI * 2;
        object.rotation.z = angleZ;
    }

    createTextTexture(text, width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        const fontSize = 32;
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
        const length = 0.6;
        const width = 1;
        const bevelThickness = 0.02;
        const bevelSize = 0.02;

        const shape = new THREE.Shape();
        shape.moveTo( 0,0 );
        shape.lineTo( 0, width );
        shape.lineTo( length, width );
        shape.lineTo( length, 0 );
        shape.lineTo( 0, 0 );

        const extrudeSettings = {
            steps: 1,
            depth: 0.01,
            bevelEnabled: true,
            bevelThickness: bevelThickness,
            bevelSize: bevelSize,
            bevelOffset: 0,
            bevelSegments: 4
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

        geometry.computeBoundingBox();
        const boundingBox = geometry.boundingBox;
        const size = boundingBox.getSize(new THREE.Vector3());

        const offsetX = (size.x - bevelSize * 2) / 2;
        const offsetY = (size.y - bevelSize * 2) / 2;
        const offsetZ = (size.z - bevelThickness * 2) / 2;
        geometry.translate(-offsetX, -offsetY, -offsetZ);

        return geometry;
    }
}