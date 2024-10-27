uniform float uTime;
uniform vec3 uColorWaterSurface;
uniform vec3 uColorWaterFoam;

varying vec3 vPosition;

#include ../includes/simplexNoise4D.glsl

void main() {
    vec3 displacedPos = vPosition + vec3(simplexNoise4D(vec4(vPosition * 0.6, uTime * 0.014)));
    float strength = simplexNoise4D(vec4(displacedPos * 0.9, uTime * 0.008));

    strength = clamp(strength, 0.0, 1.0);
    strength = step(0.1, strength);

    vec3 finalColor = mix(uColorWaterSurface, uColorWaterFoam, strength);

    csm_DiffuseColor = vec4(finalColor, 1.0);
}