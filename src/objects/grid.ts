// Perspective grid floor for the "intro" scene.
// Receding lines that fade with distance — gives the sense of a stage we're standing on.

import * as THREE from 'three';

export interface Grid {
  group: THREE.Group;
  tick: (t: number) => void;
}

export function createGrid(size = 80, divisions = 40): Grid {
  const group = new THREE.Group();

  const grid = new THREE.GridHelper(size, divisions, 0x2ec8ff, 0x1a3a8a);
  const mat = grid.material as THREE.Material | THREE.Material[];
  if (Array.isArray(mat)) {
    mat.forEach((m) => {
      (m as THREE.Material).transparent = true;
      (m as THREE.Material).opacity = 0.35;
    });
  } else {
    mat.transparent = true;
    mat.opacity = 0.35;
  }
  grid.position.y = -3;
  group.add(grid);

  // Soft horizon glow
  const horizonGeo = new THREE.PlaneGeometry(size * 2, 8);
  const horizonMat = new THREE.MeshBasicMaterial({
    color: 0x2ec8ff,
    transparent: true,
    opacity: 0.07,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  const horizon = new THREE.Mesh(horizonGeo, horizonMat);
  horizon.position.set(0, -2.5, -size / 2);
  group.add(horizon);

  const tick = (t: number) => {
    grid.position.z = (t * 0.6) % 2;
  };

  return { group, tick };
}
