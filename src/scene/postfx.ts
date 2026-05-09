// Post-processing composer using pmndrs/postprocessing.
// One merged fullscreen pass; bloom now, DOF + chromatic in later tasks.

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
      intensity: 0.65,
      luminanceThreshold: 0.18,
      luminanceSmoothing: 0.4,
      kernelSize: KernelSize.LARGE
    });
    composer.addPass(new EffectPass(camera, bloom));
  }

  return { composer, setSize: (w, h) => composer.setSize(w, h) };
}
