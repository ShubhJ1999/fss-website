varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vPosition;

uniform float uTime;
uniform vec3 uCoreColor;
uniform vec3 uRimColor;

void main() {
  float fres = pow(1.0 - max(0.0, dot(vNormal, vViewDir)), 2.4);
  float bands = sin(vPosition.y * 8.0 + uTime * 2.0) * 0.5 + 0.5;
  float swirl = sin(vPosition.x * 6.0 + vPosition.z * 6.0 + uTime * 1.4) * 0.5 + 0.5;
  vec3 core = uCoreColor * (0.5 + 0.5 * mix(bands, swirl, 0.5));
  vec3 col = mix(core, uRimColor, fres);
  gl_FragColor = vec4(col, 1.0);
}
