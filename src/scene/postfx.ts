// Post-processing composer: bloom only, gated on quality.
// Editorial layout doesn't need DOF — there's only the atom in the scene.

import * as THREE from 'three';
import {
  EffectComposer, RenderPass, EffectPass,
  BloomEffect, BlendFunction, KernelSize
} from 'postprocessing';
import type { Quality } from './quality';

export interface PostFx {
  composer: EffectComposer;
  setSize: (w: number, h: number) => void;
}

export function createPostFx(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  quality: Quality
): PostFx {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  if (quality.bloomEnabled) {
    const bloom = new BloomEffect({
      blendFunction: BlendFunction.ADD,
      intensity: 0.7,
      luminanceThreshold: 0.18,
      luminanceSmoothing: 0.4,
      kernelSize: KernelSize.LARGE
    });
    composer.addPass(new EffectPass(camera, bloom));
  }

  return { composer, setSize: (w, h) => composer.setSize(w, h) };
}
