// Process pipeline: five glowing waypoints connected by a tube the camera follows.
// Represents Discovery → Design → Build → Ship → Support.

import * as THREE from 'three';

export interface Pipeline {
  group: THREE.Group;
  curve: THREE.CatmullRomCurve3;
  packets: THREE.Mesh[];
  tick: (t: number) => void;
}

export const PROCESS_STEPS = ['Discovery', 'Design', 'Build', 'Ship', 'Support'];

export function createPipeline(): Pipeline {
  const group = new THREE.Group();

  // Centered roughly at z = -50, flowing further into the distance
  const points = [
    new THREE.Vector3(-8, 1.2, -45),
    new THREE.Vector3(-3, -0.5, -50),
    new THREE.Vector3(2, 0.8, -55),
    new THREE.Vector3(6, -0.4, -60),
    new THREE.Vector3(11, 1.0, -66)
  ];

  const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.4);

  // Tube
  const tubeGeo = new THREE.TubeGeometry(curve, 240, 0.05, 12, false);
  const tubeMat = new THREE.MeshBasicMaterial({
    color: 0x2ec8ff,
    transparent: true,
    opacity: 0.5
  });
  group.add(new THREE.Mesh(tubeGeo, tubeMat));

  // Waypoint nodes
  points.forEach((p) => {
    const nodeGeo = new THREE.OctahedronGeometry(0.45, 0);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x6fdcff,
      emissive: 0x2ec8ff,
      emissiveIntensity: 1.2,
      roughness: 0.2,
      metalness: 0.5
    });
    const node = new THREE.Mesh(nodeGeo, nodeMat);
    node.position.copy(p);
    group.add(node);

    const ringGeo = new THREE.RingGeometry(0.7, 0.74, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x2ec8ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(p);
    group.add(ring);
  });

  // Glowing packets that travel along the curve
  const packets: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const pktGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const pktMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x6fdcff,
      emissiveIntensity: 3,
      roughness: 0
    });
    const pkt = new THREE.Mesh(pktGeo, pktMat);
    pkt.userData.offset = i / 3;
    packets.push(pkt);
    group.add(pkt);
  }

  const tick = (t: number) => {
    packets.forEach((pkt) => {
      const u = ((t * 0.06) + (pkt.userData.offset as number)) % 1;
      const pos = curve.getPointAt(u);
      pkt.position.copy(pos);
    });
  };

  return { group, curve, packets, tick };
}
