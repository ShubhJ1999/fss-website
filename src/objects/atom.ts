// Hero atom: a glowing core with three orbital rings of particles.
// Stand-in for the "fermion" — single subatomic particle, not multiple.

import * as THREE from 'three';
import { createFermionMaterial } from './atom-shader/material';

export interface Atom {
  group: THREE.Group;
  tick: (t: number) => void;
}

export function createAtom(): Atom {
  const group = new THREE.Group();

  // Core — driven by the fermion GLSL shader (see atom-shader/material.ts).
  const fermion = createFermionMaterial();
  const coreGeo = new THREE.SphereGeometry(0.55, 64, 64);
  const core = new THREE.Mesh(coreGeo, fermion.material);
  group.add(core);

  // Inner glow shell (slightly larger, transparent)
  const glowGeo = new THREE.IcosahedronGeometry(0.85, 2);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x6fdcff,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  group.add(new THREE.Mesh(glowGeo, glowMat));

  // Orbital rings
  const rings: THREE.Mesh[] = [];
  const ringConfigs = [
    { r: 1.6, tilt: 0,            speed: 0.6 },
    { r: 2.2, tilt: Math.PI / 3,  speed: -0.4 },
    { r: 2.8, tilt: Math.PI / 1.7, speed: 0.3 }
  ];

  for (const cfg of ringConfigs) {
    const ringGeo = new THREE.TorusGeometry(cfg.r, 0.008, 8, 200);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x2ec8ff,
      transparent: true,
      opacity: 0.35
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = cfg.tilt;
    ring.userData.speed = cfg.speed;
    rings.push(ring);
    group.add(ring);
  }

  // Orbiting particles — one per ring
  const orbiters: { mesh: THREE.Mesh; r: number; speed: number; phase: number; tilt: number }[] = [];
  ringConfigs.forEach((cfg, i) => {
    const pGeo = new THREE.SphereGeometry(0.07, 16, 16);
    const pMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x6fdcff,
      emissiveIntensity: 2.2,
      roughness: 0.1
    });
    const p = new THREE.Mesh(pGeo, pMat);
    orbiters.push({ mesh: p, r: cfg.r, speed: cfg.speed * 1.4, phase: i * 1.7, tilt: cfg.tilt });
    group.add(p);
  });

  const tick = (t: number) => {
    fermion.tick(t);
    core.rotation.y = t * 0.15;
    rings.forEach((r) => { r.rotation.z = t * (r.userData.speed as number); });
    orbiters.forEach((o) => {
      const a = t * o.speed + o.phase;
      const x = Math.cos(a) * o.r;
      const y = Math.sin(a) * o.r * Math.sin(o.tilt);
      const z = Math.sin(a) * o.r * Math.cos(o.tilt);
      o.mesh.position.set(x, y, z);
    });
  };

  return { group, tick };
}
