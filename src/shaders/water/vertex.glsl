uniform float uTime;
uniform float uStrength;

varying vec3 vPosition;

void main() {
    vec3 newPosition = csm_Position;

    float distanceFromCenter = length(newPosition);

    float elevation1 = sin(distanceFromCenter * 0.3 - uTime) * 0.15;
    float elevation2 = sin(distanceFromCenter * 1.1 - uTime) * 0.1;
    float elevation3 = sin(distanceFromCenter * 4.5 - uTime) * 0.05;

    float elevation = elevation1 + elevation2 + elevation3;

    newPosition += normalize(newPosition) * elevation * uStrength;

    csm_Position = newPosition;

    // Varyings
    vPosition = csm_Position;
}