precision mediump float;

#pragma glslify: inverse = require("glsl-inverse")

attribute vec2 a, d;

uniform mat3 matrix;
uniform vec2 screenShape;
uniform float width;

varying vec2 direction;

void main() {
  vec2 dir = (matrix * vec3(d, 0)).xy;
  vec3 base = matrix * vec3(a, 1);
  vec2 n = 0.5 * width *
    normalize(screenShape.yx * vec2(dir.y, -dir.x)) / screenShape.xy;
  vec2 tangent = normalize(screenShape.xy * dir);
  if(dir.x < 0.0 || (dir.x == 0.0 && dir.y < 0.0)) {
    direction = -tangent;
  } else {
    direction = tangent;
  }
  gl_Position = vec4(base.xy/base.z + n, 0, 1);
}
