precision lowp float;

uniform float uTime;
uniform vec2 uFrequency;

varying vec3 vPosition;

void main() {
    vec3 newPosition = csm_Position;

    float elevation = sin((newPosition.x * uFrequency.x) - uTime) * 0.1;
    elevation += sin((newPosition.y * uFrequency.y) - uTime) * 0.1;
    newPosition.z += elevation * 0.1;

    csm_Position = newPosition;

    // Varyings
    vPosition = csm_Position;
}