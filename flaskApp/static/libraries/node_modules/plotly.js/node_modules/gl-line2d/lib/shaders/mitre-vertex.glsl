precision mediump float;

attribute vec2 p;

uniform mat3  matrix;
uniform vec2 screenShape;
uniform float radius;

void main() {
  vec3 pp = matrix * vec3(p, 1);
  gl_Position  = vec4(pp.xy, 0, pp.z);
  gl_PointSize = radius;
}
