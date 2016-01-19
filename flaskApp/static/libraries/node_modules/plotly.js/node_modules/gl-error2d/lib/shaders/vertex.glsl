precision mediump float;

attribute vec2 position;
attribute vec2 pixelOffset;

uniform mat3 viewTransform;
uniform vec2 pixelScale;

void main() {
  vec3 scrPosition = viewTransform * vec3(position, 1);
  gl_Position = vec4(
    scrPosition.xy + scrPosition.z * pixelScale * pixelOffset,
    0,
    scrPosition.z);
}
