const workerData = {
    gpgpuCount: null,
    positionsGeometryArray: null
};

const selectedPoints = [];
let pointsCount = null;
let pointsMinDistance = null;

/*const getRandomPointOnSphere = (radius) => {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    return { x, y, z };
};*/



self.onmessage = (event) => {
    const {
        step,
        gpgpuCount,
        positionsGeometryBuffer,
        positionsTextureBuffer,
        positionsBuffer,
        originalPositionsBuffer,
        wobblesBuffer,
        sphereRadius,
        interestPointsLength,
        interestPointsMinDistance
    } = event.data;

    if (step === 1) {
        const positionsGeometryArray = new Float32Array(positionsGeometryBuffer);
        const positionsTextureArray = new Float32Array(positionsTextureBuffer);

        for (let i = 0; i < gpgpuCount; i++) {
            const i3 = i * 3; // xyz
            const i4 = i * 4; // rgba

            positionsTextureArray[i4] = positionsGeometryArray[i3];
            positionsTextureArray[i4 + 1] = positionsGeometryArray[i3 + 1];
            positionsTextureArray[i4 + 2] = positionsGeometryArray[i3 + 2];
            positionsTextureArray[i4 + 3] = 0; // data channel will be used for wobble value
        }

        workerData.gpgpuCount = gpgpuCount;
        workerData.positionsGeometryArray = positionsGeometryArray;

        self.postMessage(
            {
                step,
                positionsTextureBuffer: positionsTextureArray.buffer
            },
            [
                positionsTextureArray.buffer
            ]
        );

        return;
    }



    // step 2
    const positionsArray = new Float32Array(positionsBuffer);
    const originalPositionsArray = new Float32Array(originalPositionsBuffer);
    const wobblesArray = new Float32Array(wobblesBuffer);

    pointsCount = interestPointsLength;
    pointsMinDistance = interestPointsMinDistance;

    for (let i = 0; i < workerData.gpgpuCount; i++) {
        const i3 = i * 3; // xyz
        const i4 = i * 4; // rgba

        const x = positionsArray[i4]; // r
        const y = positionsArray[i4 + 1]; // g
        const z = positionsArray[i4 + 2]; // b
        const w = positionsArray[i4 + 3]; // a

        originalPositionsArray[i3] = x;
        originalPositionsArray[i3 + 1] = y;
        originalPositionsArray[i3 + 2] = z;

        workerData.positionsGeometryArray[i3] = x;
        workerData.positionsGeometryArray[i3 + 1] = y;
        workerData.positionsGeometryArray[i3 + 2] = z;
        wobblesArray[i] = w;



        if (selectedPoints.length < pointsCount) {
            selectedPoints.push({ x, y, z });
        } else {
            let minIndex = -1;
            let minDistance = Infinity;

            for (let j = 0; j < selectedPoints.length; j++) {
                const existingPoint = selectedPoints[j];
                const existingDistance = Math.sqrt(existingPoint.x ** 2 + existingPoint.y ** 2 + existingPoint.z ** 2);
                if (existingDistance < minDistance) {
                    minDistance = existingDistance;
                    minIndex = j;
                }
            }

            let canAdd = true;

            for (let j = 0; j < selectedPoints.length; j++) {
                const existingPoint = selectedPoints[j];
                const distance = Math.sqrt((x - existingPoint.x) ** 2 + (y - existingPoint.y) ** 2 + (z - existingPoint.z) ** 2);
                if (distance < pointsMinDistance) {
                    canAdd = false;
                    break;
                }
            }

            if (canAdd) {
                selectedPoints[minIndex] = { x, y, z };
            } /*else {
                // TODO Check values (in-water bug ? --seed 0) & Try to get other points before random
                const randomPoint = getRandomPointOnSphere(sphereRadius);
                selectedPoints[minIndex] = randomPoint;
            }*/
        }
    }

    self.postMessage(
        {
            originalPositionsBuffer: originalPositionsArray.buffer,
            positionsGeometryBuffer: workerData.positionsGeometryArray.buffer,
            wobblesBuffer: wobblesArray.buffer,
            selectedPoints
        },
        [
            originalPositionsArray.buffer,
            workerData.positionsGeometryArray.buffer,
            wobblesArray.buffer
        ]
    );
};
