uniform vec2 uResolution;

uniform float uPositionFrequency;
uniform float uStrength;

#include ../includes/simplexNoise3D.glsl

float getWobble(vec3 position) {
    return simplexNoise3D(vec3(position * uPositionFrequency)) * uStrength;
}



void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;

    vec3 position = texture2D(uPositionsTexture, uv).xyz;

    float wobble = getWobble(position);
    vec3 newPosition = position + wobble * normalize(position); // normalize(position) = normal

    gl_FragColor = vec4(newPosition, wobble);
}