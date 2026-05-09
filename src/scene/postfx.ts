// Post-processing composer: bloom, plus DOF + chromatic in later tasks.
// Owns its own EffectComposer; main.ts renders through this.

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export interface PostFx {
  composer: EffectComposer;
  setSize: (w: number, h: number) => void;
}

export function createPostFx(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
): PostFx {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.65, // strength
    0.7,  // radius
    0.18  // threshold
  ));
  return { composer, setSize: (w, h) => composer.setSize(w, h) };
}
