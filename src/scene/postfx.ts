// Post-processing composer using pmndrs/postprocessing.
// One merged fullscreen stack: bloom + scroll-driven depth-of-field (gated by quality tier).

import * as THREE from 'three';
import {
  EffectComposer, RenderPass, EffectPass,
  BloomEffect, DepthOfFieldEffect,
  BlendFunction, KernelSize
} from 'postprocessing';
import type { Quality } from './quality';

export interface PostFx {
  composer: EffectComposer;
  setSize: (w: number, h: number) => void;
  dof: DepthOfFieldEffect | null;
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

  let dof: DepthOfFieldEffect | null = null;
  if (quality.dofEnabled) {
    dof = new DepthOfFieldEffect(camera, {
      focusDistance: 0.0,
      focalLength: 0.05,
      bokehScale: 2.0
    });
    composer.addPass(new EffectPass(camera, dof));
  }

  return {
    composer,
    setSize: (w, h) => composer.setSize(w, h),
    dof
  };
}
