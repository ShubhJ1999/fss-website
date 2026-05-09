// Master scroll timeline: ties camera position + lookAt + per-object opacity to scroll progress.
// Uses GSAP + ScrollTrigger; one timeline for the full page, scrubbed by scroll.

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import type { Stage } from './scene';
import type { Atom } from './objects/atom';
import type { Grid } from './objects/grid';
import type { ServiceConstellation } from './objects/services';
import type { Pipeline } from './objects/pipeline';
import type { Globe } from './objects/globe';
import { getMotionMode } from './scene/motion';

gsap.registerPlugin(ScrollTrigger);

export interface SceneRefs {
  stage: Stage;
  atom: Atom;
  grid: Grid;
  services: ServiceConstellation;
  pipeline: Pipeline;
  globe: Globe;
}

export function buildTimeline(refs: SceneRefs): gsap.core.Timeline | null {
  const { stage, atom, grid, services, pipeline, globe } = refs;
  const cam = stage.camera;
  const lookAt = new THREE.Vector3(0, 0, 0);
  const lookProxy = { x: 0, y: 0, z: 0 };

  const applyLookAt = () => {
    lookAt.set(lookProxy.x, lookProxy.y, lookProxy.z);
    cam.lookAt(lookAt);
  };

  // Initial visibility — atom on, others off
  grid.group.visible = false;
  services.group.visible = false;
  pipeline.group.visible = false;
  globe.group.visible = false;

  if (getMotionMode() === 'reduced') {
    gsap.set(cam.position, { x: 0, y: 0, z: 8 });
    applyLookAt();
    grid.group.visible = true;
    services.group.visible = true;
    pipeline.group.visible = true;
    globe.group.visible = true;
    return null;
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#scroll',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1
    },
    onUpdate: applyLookAt
  });

  // ── Scene 1 → 2 (Hero atom → grid) ───────────────────────────────────────
  tl.to(cam.position, { x: 0, y: 1, z: 14, duration: 1, ease: 'power2.inOut' }, 0)
    .to(lookProxy,    { x: 0, y: 0, z: 0,  duration: 1, ease: 'power2.inOut' }, 0)
    .to(atom.group.position, { y: -1.5, duration: 1, ease: 'power2.inOut' }, 0)
    .to(atom.group.scale,    { x: 0.6, y: 0.6, z: 0.6, duration: 1, ease: 'power2.inOut' }, 0)
    .set(grid.group, { visible: true }, 0.3)
    .fromTo(grid.group.position, { y: -8 }, { y: 0, duration: 0.7, ease: 'power2.out' }, 0.3);

  // ── Scene 2 → 3 (Grid → service constellation flythrough) ───────────────
  tl.set(services.group, { visible: true }, 1)
    .to(cam.position, { x: -3, y: 0.4, z: -2, duration: 1, ease: 'power2.inOut' }, 1)
    .to(lookProxy,    { x: -6, y: 0,   z: -10, duration: 1, ease: 'power2.inOut' }, 1)
    .to(atom.group.scale,    { x: 0.2, y: 0.2, z: 0.2, duration: 0.6, ease: 'power2.in' }, 1)
    .to((atom.group.children[0] as THREE.Mesh).scale, { x: 0.2, y: 0.2, z: 0.2, duration: 0.6 }, 1);

  // Fly through Build cluster
  tl.to(cam.position, { x: -5, y: 0.2, z: -8, duration: 1, ease: 'none' }, 2)
    .to(lookProxy,    { x: -3, y: 0,   z: -14, duration: 1, ease: 'none' }, 2);

  // Drift to Run cluster
  tl.to(cam.position, { x: 0, y: 0.3, z: -18, duration: 1, ease: 'none' }, 3)
    .to(lookProxy,    { x: 0, y: 0,   z: -24, duration: 1, ease: 'none' }, 3);

  // Drift to Grow cluster
  tl.to(cam.position, { x: 5, y: 0.3, z: -28, duration: 1, ease: 'none' }, 4)
    .to(lookProxy,    { x: 6, y: 0,   z: -34, duration: 1, ease: 'none' }, 4);

  // ── Scene 4 (Pipeline) ──────────────────────────────────────────────────
  tl.set(pipeline.group, { visible: true }, 5)
    .to(cam.position, { x: -7, y: 2,   z: -38, duration: 1, ease: 'power2.inOut' }, 5)
    .to(lookProxy,    { x: -8, y: 1.2, z: -45, duration: 1, ease: 'power2.inOut' }, 5);

  // Travel along the pipeline
  tl.to(cam.position, { x: 6, y: 1.5, z: -54, duration: 1, ease: 'none' }, 6)
    .to(lookProxy,    { x: 8, y: 0.5, z: -62, duration: 1, ease: 'none' }, 6);

  // ── Scene 5 (Globe) ─────────────────────────────────────────────────────
  tl.set(globe.group, { visible: true }, 7)
    .to(cam.position, { x: 0, y: 3, z: -72, duration: 1, ease: 'power2.inOut' }, 7)
    .to(lookProxy,    { x: 0, y: -2, z: -85, duration: 1, ease: 'power2.inOut' }, 7);

  tl.to(cam.position, { x: 0, y: 0, z: -78, duration: 1, ease: 'power2.inOut' }, 8)
    .to(lookProxy,    { x: 0, y: -2, z: -85, duration: 1, ease: 'power2.inOut' }, 8);

  // ── Scene 6 (Contact lift) — camera climbs high, globe sits low in frame ─
  tl.to(cam.position, { x: 0, y: 18, z: -70, duration: 1, ease: 'power2.inOut' }, 9)
    .to(lookProxy,    { x: 0, y: -6, z: -90, duration: 1, ease: 'power2.inOut' }, 9)
    .to(globe.group.scale, { x: 0.65, y: 0.65, z: 0.65, duration: 1, ease: 'power2.inOut' }, 9);

  return tl;
}
