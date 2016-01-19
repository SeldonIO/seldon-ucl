vec4 computePosition(vec2 position, vec2 offset, mat3 view, vec2 scale) {
  vec3 xposition = view * vec3(position, 1.0);
  return vec4(
    xposition.xy + scale * offset * xposition.z,
    0,
    xposition.z);
}

#pragma glslify: export(computePosition)
