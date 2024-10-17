const workerData = {
    gpgpuCount: null,
    positionsGeometryArray: null
};

const selectedPoints = [];



const isPointValid = (point, minDistanceFromCenter, minDistanceFromPoints) => {
    const distanceFromCenter = Math.sqrt(point.x ** 2 + point.y ** 2 + point.z ** 2);

    if (distanceFromCenter < minDistanceFromCenter) {
        return false;
    }

    for (const existingPoint of selectedPoints) {
        const distance = Math.sqrt((point.x - existingPoint.x) ** 2 + (point.y - existingPoint.y) ** 2 + (point.z - existingPoint.z) ** 2);
        if (distance < minDistanceFromPoints) {
            return false;
        }
    }

    return true;
};



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
        interestPointsLength
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
    }

    

    const pointsCount = interestPointsLength;
    const pointMaxAttempts = 100;
    const minDistanceFromCenter = 0.25;
    const minDistanceFromPoints = 1;

    while (selectedPoints.length < pointsCount) {
        let isCheckValid = false;

        // search...
        for (let counter = 0; counter < pointMaxAttempts; counter++) {
            const randomIndex = Math.floor(Math.random() * workerData.gpgpuCount);
            const i3 = randomIndex * 3; // xyz

            const x = workerData.positionsGeometryArray[i3];
            const y = workerData.positionsGeometryArray[i3 + 1];
            const z = workerData.positionsGeometryArray[i3 + 2];

            const point = { x, y, z };

            if (isPointValid(point, sphereRadius + minDistanceFromCenter, minDistanceFromPoints)) {
                selectedPoints.push(point);
                isCheckValid = true;
                break;
            }
        }

        // try again with sorter distance
        if (!isCheckValid) {
            for (let counter = 0; counter < (pointMaxAttempts / 2); counter++) {
                const randomIndex = Math.floor(Math.random() * workerData.gpgpuCount);
                const i3 = randomIndex * 3; // xyz

                const x = workerData.positionsGeometryArray[i3];
                const y = workerData.positionsGeometryArray[i3 + 1];
                const z = workerData.positionsGeometryArray[i3 + 2];

                const point = { x, y, z };

                if (isPointValid(point, sphereRadius + (minDistanceFromCenter / 2), (minDistanceFromPoints / 2))) {
                    selectedPoints.push(point);
                    isCheckValid = true;
                    break;
                }
            }
        }

        // random fallback
        if (!isCheckValid) {
            const randomIndex = Math.floor(Math.random() * workerData.gpgpuCount);
            const i3 = randomIndex * 3; // xyz

            const x = workerData.positionsGeometryArray[i3];
            const y = workerData.positionsGeometryArray[i3 + 1];
            const z = workerData.positionsGeometryArray[i3 + 2];

            const point = { x, y, z };
            selectedPoints.push(point);
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
