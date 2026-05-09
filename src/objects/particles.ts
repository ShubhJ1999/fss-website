// Background particle field — drifting motes that give parallax depth.
// Used across the entire scroll, density tuned for 60fps on mid laptops.

import * as THREE from 'three';

export interface ParticleField {
  points: THREE.Points;
  tick: (t: number) => void;
}

export function createParticleField(count = 1400, radius = 60): ParticleField {
  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    // Spherical distribution with bias toward the back
    const r = radius * (0.3 + Math.random() * 0.7);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    speeds[i] = 0.05 + Math.random() * 0.15;
    sizes[i] = 0.3 + Math.random() * 1.4;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({
    color: 0x9fdcff,
    size: 0.06,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const points = new THREE.Points(geo, mat);

  const tick = (t: number) => {
    const arr = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const idx = i * 3 + 1;
      arr[idx] += Math.sin(t * speeds[i] + i) * 0.0025;
    }
    geo.attributes.position.needsUpdate = true;
    points.rotation.y = t * 0.012;
  };

  return { points, tick };
}
