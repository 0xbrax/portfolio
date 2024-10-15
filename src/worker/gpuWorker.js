import { GPUComputationRenderer } from "three/addons";
// import { } from 'three';


self.onmessage = (event) => {
    const { test } = event.data;

    console.log('WORKER', test, GPUComputationRenderer )

    self.postMessage({ output: test });
};
