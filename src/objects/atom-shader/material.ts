// Fermion shader material. Driven by a single uTime uniform.
// Provides the ShaderMaterial used by the hero atom + a tick to drive its time.

import * as THREE from 'three';
import vert from './atom.vert.glsl';
import frag from './atom.frag.glsl';

export interface FermionMaterial {
  material: THREE.ShaderMaterial;
  tick: (t: number) => void;
}

export function createFermionMaterial(): FermionMaterial {
  const material = new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    uniforms: {
      uTime: { value: 0 },
      uCoreColor: { value: new THREE.Color(0x2ec8ff) },
      uRimColor: { value: new THREE.Color(0x6fdcff) }
    }
  });
  return {
    material,
    tick: (t) => {
      material.uniforms.uTime.value = t;
    }
  };
}
