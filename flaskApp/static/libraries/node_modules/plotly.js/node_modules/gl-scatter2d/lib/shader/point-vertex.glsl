precision mediump float;

attribute vec2 position;
attribute float weight;

uniform mat3 matrix;
uniform float pointSize, useWeight;

varying float fragWeight;

void main() {
  vec3 hgPosition = matrix * vec3(position, 1);
  gl_Position  = vec4(hgPosition.xy, 0, hgPosition.z);
  gl_PointSize = pointSize;
  fragWeight = mix(1.0, weight, useWeight);
}
