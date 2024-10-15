const workerData = {
    gpgpuCount: null,
    positionsGeometryArray: null
};

self.onmessage = (event) => {
    const {
        step,
        gpgpuCount,
        positionsGeometryBuffer,
        positionsTextureBuffer,
        positionsBuffer,
        originalPositionsBuffer,
        wobblesBuffer
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

    self.postMessage(
        {
            originalPositionsBuffer: originalPositionsArray.buffer,
            positionsGeometryBuffer: workerData.positionsGeometryArray.buffer,
            wobblesBuffer: wobblesArray.buffer
        },
        [
            originalPositionsArray.buffer,
            workerData.positionsGeometryArray.buffer,
            wobblesArray.buffer
        ]
    );
};
