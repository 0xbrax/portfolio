attribute vec3 aOriginalPosition;
attribute vec4 tangent;
attribute float aWobble;

uniform float uPositionFrequency;
uniform float uSeed;
uniform float uStrength;

varying vec3 vPosition;
varying float vWobble;
varying float vUpDot;

#include ../includes/simplexNoise4D.glsl

float getWobble(vec3 position) {
    return simplexNoise4D(vec4(vec3(position * uPositionFrequency), uSeed)) * uStrength;
}



void main() {
    vec3 biTangent = cross(normal, tangent.xyz);

    // Neighbours
    float shift = 0.01;
    vec3 positionA = aOriginalPosition + tangent.xyz * shift;
    vec3 positionB = aOriginalPosition + biTangent * shift;

    // Wobble
    float wobble = getWobble(aOriginalPosition);
    vec3 newPosition = aOriginalPosition + wobble * normal;

    positionA += getWobble(positionA) * normal;
    positionB += getWobble(positionB) * normal;

    // Compute normal
    vec3 toA = normalize(positionA - newPosition);
    vec3 toB = normalize(positionB - newPosition);
    csm_Normal = cross(toA, toB);



    // Varyings
    vPosition = position;
    vWobble = aWobble / uStrength;

    vec3 fromCenter = normalize(newPosition);
    vUpDot = dot(csm_Normal, fromCenter);
}
