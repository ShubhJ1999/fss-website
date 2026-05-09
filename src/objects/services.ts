// Service constellation: 14 service nodes grouped into 3 clusters (Build / Run / Grow).
// Each node has a position the camera can fly past, and a label that mounts in DOM.

import * as THREE from 'three';
import { BatchedMesh } from 'three';
import { SERVICES, type ServiceCluster, type Service } from '../content/services';

export interface ServiceNode {
  service: Service;
  position: THREE.Vector3;
  outerInstId: number;
  innerInstId: number;
  glow: THREE.Mesh;
}

export interface ServiceConstellation {
  group: THREE.Group;
  nodes: ServiceNode[];
  tick: (t: number) => void;
}

const CLUSTER_OFFSET: Record<ServiceCluster, THREE.Vector3> = {
  Build: new THREE.Vector3(-6, 0, -10),
  Run:   new THREE.Vector3(0,  0, -22),
  Grow:  new THREE.Vector3(6,  0, -34)
};

export function createServices(): ServiceConstellation {
  const group = new THREE.Group();
  const nodes: ServiceNode[] = [];

  // Stable per-cluster index so layout is deterministic
  const perCluster: Record<ServiceCluster, number> = { Build: 0, Run: 0, Grow: 0 };

  // Shared geometry / materials, one batched draw call per layer (outer wireframe + inner solid)
  const SHARED_GEO_OUTER = new THREE.IcosahedronGeometry(0.4, 0);
  const SHARED_GEO_INNER = new THREE.IcosahedronGeometry(0.32, 0);

  const outerMat = new THREE.MeshBasicMaterial({
    color: 0x2ec8ff, wireframe: true, transparent: true, opacity: 0.55
  });
  const innerMat = new THREE.MeshStandardMaterial({
    color: 0x0a1450, emissive: 0x1f6ee8, emissiveIntensity: 0.4,
    roughness: 0.4, metalness: 0.3
  });

  const totalInstances = SERVICES.length;
  const totalVertsOuter = SERVICES.length * SHARED_GEO_OUTER.attributes.position.count;
  const totalIdxOuter = SERVICES.length * (SHARED_GEO_OUTER.index?.count ?? 0);
  const totalVertsInner = SERVICES.length * SHARED_GEO_INNER.attributes.position.count;
  const totalIdxInner = SERVICES.length * (SHARED_GEO_INNER.index?.count ?? 0);

  const batchedOuter = new BatchedMesh(totalInstances, totalVertsOuter, totalIdxOuter, outerMat);
  const batchedInner = new BatchedMesh(totalInstances, totalVertsInner, totalIdxInner, innerMat);

  const outerGeoId = batchedOuter.addGeometry(SHARED_GEO_OUTER);
  const innerGeoId = batchedInner.addGeometry(SHARED_GEO_INNER);

  const tmpMatrix = new THREE.Matrix4();

  SERVICES.forEach((svc) => {
    const offset = CLUSTER_OFFSET[svc.cluster];
    const idx = perCluster[svc.cluster]++;
    const ring = Math.floor(idx / 3);
    const angle = (idx % 6) * (Math.PI / 3) + ring * 0.4;
    const r = 2.0 + ring * 0.8;

    const pos = new THREE.Vector3(
      offset.x + Math.cos(angle) * r,
      offset.y + Math.sin(angle) * r * 0.7,
      offset.z + (Math.sin(angle * 1.3) - 0.2) * 1.4
    );

    tmpMatrix.makeTranslation(pos.x, pos.y, pos.z);
    const outerInstId = batchedOuter.addInstance(outerGeoId);
    batchedOuter.setMatrixAt(outerInstId, tmpMatrix);
    const innerInstId = batchedInner.addInstance(innerGeoId);
    batchedInner.setMatrixAt(innerInstId, tmpMatrix);

    // Soft additive glow stays an individual mesh (additive blending doesn't batch cleanly)
    const glowGeo = new THREE.SphereGeometry(0.7, 12, 12);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x6fdcff,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.copy(pos);
    group.add(glow);

    nodes.push({ service: svc, position: pos.clone(), outerInstId, innerInstId, glow });
  });

  group.add(batchedOuter);
  group.add(batchedInner);

  // Connecting lines within each cluster
  (['Build', 'Run', 'Grow'] as ServiceCluster[]).forEach((cluster) => {
    const clusterNodes = nodes.filter((n) => n.service.cluster === cluster);
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < clusterNodes.length - 1; i++) {
      points.push(clusterNodes[i].position, clusterNodes[i + 1].position);
    }
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x1f6ee8,
      transparent: true,
      opacity: 0.18
    });
    group.add(new THREE.LineSegments(lineGeo, lineMat));
  });

  const tick = (t: number) => {
    nodes.forEach((n, i) => {
      tmpMatrix.makeRotationFromEuler(new THREE.Euler(t * 0.3 + i, t * 0.4 + i * 0.2, 0));
      tmpMatrix.setPosition(n.position);
      batchedOuter.setMatrixAt(n.outerInstId, tmpMatrix);
      batchedInner.setMatrixAt(n.innerInstId, tmpMatrix);
      const breathe = 1 + Math.sin(t * 1.2 + i) * 0.06;
      n.glow.scale.setScalar(breathe);
    });
  };

  return { group, nodes, tick };
}
