attribute vec3 aOriginalPosition;
attribute vec4 tangent;
attribute float aElevation;

uniform float uPositionFrequency;
uniform float uSeed;
uniform float uStrength;

varying vec3 vPosition;
varying float vElevation;
varying float vUpDot;

#include ../includes/simplexNoise4D.glsl

float getElevation(vec3 position) {
    return simplexNoise4D(vec4(vec3(position * uPositionFrequency), uSeed)) * uStrength;
}



void main() {
    vec3 biTangent = cross(normal, tangent.xyz);

    // Neighbours
    float shift = 0.01;
    vec3 positionA = aOriginalPosition + tangent.xyz * shift;
    vec3 positionB = aOriginalPosition + biTangent * shift;

    // Elevation
    float elevation = getElevation(aOriginalPosition);
    vec3 newPosition = aOriginalPosition + elevation * normal;

    positionA += getElevation(positionA) * normal;
    positionB += getElevation(positionB) * normal;

    // Compute normal
    vec3 toA = normalize(positionA - newPosition);
    vec3 toB = normalize(positionB - newPosition);
    csm_Normal = cross(toA, toB);



    // Varyings
    vPosition = position;
    vElevation = aElevation / uStrength;

    vec3 fromCenter = normalize(newPosition);
    vUpDot = dot(csm_Normal, fromCenter);
}
