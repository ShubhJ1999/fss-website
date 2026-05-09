// DOM overlay helpers: project 3D positions to screen and mount service tags.
// Keeps text crisp and accessible, while the canvas owns the visual story.

import * as THREE from 'three';
import type { Stage } from '../scene';
import type { ServiceNode } from '../objects/services';

export interface OverlayHandles {
  tags: HTMLElement[];
  update: () => void;
}

export function mountServiceTags(stage: Stage, nodes: ServiceNode[]): OverlayHandles {
  const root = document.querySelector<HTMLElement>('.services-grid');
  if (!root) return { tags: [], update: () => {} };

  const tags: HTMLElement[] = nodes.map((n) => {
    const el = document.createElement('div');
    el.className = 'service-tag';
    el.textContent = n.service.name;
    root.appendChild(el);
    return el;
  });

  const tmp = new THREE.Vector3();

  const update = () => {
    const { w, h } = stage.size();
    nodes.forEach((n, i) => {
      tmp.copy(n.position).project(stage.camera);
      const x = (tmp.x * 0.5 + 0.5) * w;
      const y = (-tmp.y * 0.5 + 0.5) * h;
      const visible = tmp.z < 1 && tmp.z > -1;
      const tag = tags[i];
      if (visible) {
        tag.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
        // Distance fade: closer to camera = brighter
        const dist = stage.camera.position.distanceTo(n.position);
        const opacity = THREE.MathUtils.clamp(1 - (dist - 4) / 18, 0.15, 1);
        tag.style.opacity = String(opacity);
        tag.classList.toggle('active', opacity > 0.7);
      } else {
        tag.style.opacity = '0';
      }
    });
  };

  return { tags, update };
}
