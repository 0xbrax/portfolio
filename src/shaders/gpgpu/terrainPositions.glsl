uniform vec2 uResolution;

uniform float uPositionFrequency;
uniform float uSeed;
uniform float uStrength;

#include ../includes/simplexNoise4D.glsl

float getElevation(vec3 position) {
    return simplexNoise4D(vec4(vec3(position * uPositionFrequency), uSeed)) * uStrength;
}



void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;

    vec3 position = texture2D(uPositionsTexture, uv).xyz;

    float elevation = getElevation(position);
    vec3 newPosition = position + elevation * normalize(position); // normalize(position) = normal

    gl_FragColor = vec4(newPosition, elevation);
}
