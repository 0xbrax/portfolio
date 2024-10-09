precision lowp float;

uniform float uTime;
uniform vec3 uColorWaterSurface;
uniform vec3 uColorWaterFoam;

varying vec3 vPosition;

#include ../includes/simplexNoise4D.glsl

void main() {
    vec3 displacedPos = vPosition + vec3(simplexNoise4D(vec4(vPosition * 0.5, uTime * 0.03)));
    float strength = simplexNoise4D(vec4(displacedPos * 1.5, uTime * 0.02));

    strength = clamp(strength, 0.0, 1.0);
    strength = step(0.1, strength);

    vec3 finalColor = mix(uColorWaterSurface, uColorWaterFoam, strength);

    csm_DiffuseColor = vec4(finalColor, 1.0);
}