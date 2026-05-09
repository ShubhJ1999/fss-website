varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vPosition;
uniform float uTime;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

void main() {
  vec3 p = position;
  float n = hash(floor(p * 4.0 + uTime * 0.4));
  p += normal * (sin(uTime * 1.2 + n * 6.28) * 0.04);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vViewDir = normalize(-mv.xyz);
  vPosition = p;
  gl_Position = projectionMatrix * mv;
}
