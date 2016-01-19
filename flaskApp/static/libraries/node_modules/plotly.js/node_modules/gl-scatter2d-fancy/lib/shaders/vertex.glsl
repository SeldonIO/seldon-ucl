precision mediump float;

attribute vec2 position;
attribute vec2 offset;
attribute vec4 color;

uniform mat3 viewTransform;
uniform vec2 pixelScale;

varying vec4 fragColor;

#pragma glslify: computePosition = require("./xform.glsl")

void main() {
  fragColor = color;

  gl_Position = computePosition(
    position,
    offset,
    viewTransform,
    pixelScale);
}
