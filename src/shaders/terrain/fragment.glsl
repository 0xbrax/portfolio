uniform vec3 uColorWaterDeep;
uniform vec3 uColorWaterSurface;
uniform vec3 uColorSand;
uniform vec3 uColorGrass;
uniform vec3 uColorRock;
uniform vec3 uColorSnow;

varying vec3 vPosition;
varying float vElevation;
varying float vUpDot;



void main() {
    // Color
    vec3 color = vec3(1.0);

    // Water
    float surfaceWaterMix = smoothstep(-1.0, 0.0, vElevation);
    color = mix(uColorWaterDeep, uColorWaterSurface, surfaceWaterMix);

    // Sand
    float sandMix = step(0.0, vElevation);
    color = mix(color, uColorSand, sandMix);

    // Grass
    float grassMix = step(0.06, vElevation);
    color = mix(color, uColorGrass, grassMix);

    // Rock
    float rockMix = vUpDot;
    rockMix = 1.0 - step(0.8, rockMix);
    rockMix *= step(0.06, vElevation);
    color = mix(color, uColorRock, rockMix);

    rockMix = step(0.6, vElevation);
    color = mix(color, uColorRock, rockMix);

    // Snow
    float snowThreshold = 0.7;
    float edgeVariation = sin(vPosition.x * 19.0) * 0.08 + sin(vPosition.y * 11.0) * 0.02;
    snowThreshold += edgeVariation;
    snowThreshold = max(snowThreshold, 0.7);
    float snowMix = step(snowThreshold, vElevation);
    color = mix(color, uColorSnow, snowMix);

    // Water surface by other object



    // Final color
    csm_DiffuseColor = vec4(color, 1.0);
}
