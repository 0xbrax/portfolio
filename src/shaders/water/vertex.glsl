uniform float uTime;
uniform float uFrequency;

varying vec3 vPosition;

void main() {
    vec3 newPosition = csm_Position;

    float elevation = sin((newPosition.x * uFrequency) - uTime) * 0.1;
    elevation += sin((newPosition.y * uFrequency) - uTime) * 0.1;
    elevation += sin((newPosition.z * uFrequency) - uTime) * 0.1;

    newPosition += normalize(newPosition) * elevation * 0.025;

    csm_Position = newPosition;

    // Varyings
    vPosition = csm_Position;
}