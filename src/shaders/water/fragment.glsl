precision lowp float;

uniform vec3 uColor;

varying float vElevation;

void main() {
    vec3 color = vec3(1.0, 1.0, 1.0);
    vec3 finalColor = mix(uColor, color, smoothstep(0.0, 1.0, vElevation * 1.5));

    csm_DiffuseColor = vec4(finalColor, 1.0);
}