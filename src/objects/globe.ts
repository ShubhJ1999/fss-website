// Wireframe globe with arcs connecting client locations.
// Used for the "reach" scene before the camera lifts to the contact landing.

import * as THREE from 'three';

export interface Globe {
  group: THREE.Group;
  tick: (t: number) => void;
}

// Lat/lng points for client regions (rough)
const LOCATIONS: [number, number][] = [
  [25.2, 55.3],   // Dubai
  [59.3, 18.1],   // Stockholm
  [40.7, -74.0],  // New York
  [22.3, 70.8],   // Rajkot (home)
  [1.35, 103.8],  // Singapore
  [51.5, -0.1]    // London
];

function latLngToVec3(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta)
  );
}

export function createGlobe(): Globe {
  const group = new THREE.Group();
  const r = 4;

  // Wireframe sphere
  const sphereGeo = new THREE.SphereGeometry(r, 36, 24);
  const sphereMat = new THREE.MeshBasicMaterial({
    color: 0x2ec8ff,
    wireframe: true,
    transparent: true,
    opacity: 0.18
  });
  group.add(new THREE.Mesh(sphereGeo, sphereMat));

  // Solid inner core (very dark) so wireframe reads
  const innerGeo = new THREE.SphereGeometry(r * 0.99, 32, 24);
  const innerMat = new THREE.MeshBasicMaterial({ color: 0x030617 });
  group.add(new THREE.Mesh(innerGeo, innerMat));

  // Location dots
  const dotGeo = new THREE.SphereGeometry(0.06, 12, 12);
  const dotMat = new THREE.MeshBasicMaterial({ color: 0x6fdcff });
  const dotPositions = LOCATIONS.map(([lat, lng]) => latLngToVec3(lat, lng, r * 1.005));
  dotPositions.forEach((p) => {
    const d = new THREE.Mesh(dotGeo, dotMat);
    d.position.copy(p);
    group.add(d);
  });

  // Arcs between consecutive locations
  for (let i = 0; i < dotPositions.length; i++) {
    const a = dotPositions[i];
    const b = dotPositions[(i + 1) % dotPositions.length];
    const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(r * 1.45);
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    const arcGeo = new THREE.TubeGeometry(curve, 40, 0.015, 8, false);
    const arcMat = new THREE.MeshBasicMaterial({
      color: 0x2ec8ff,
      transparent: true,
      opacity: 0.55
    });
    group.add(new THREE.Mesh(arcGeo, arcMat));
  }

  // Globe sits far below so the camera can descend onto it
  group.position.set(0, -2, -85);

  const tick = (t: number) => {
    group.rotation.y = t * 0.08;
  };

  return { group, tick };
}
