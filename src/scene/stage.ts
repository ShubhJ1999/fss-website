// Three.js stage: renderer, scene, camera, lights.
// One persistent scene reused across all scroll-driven scene-regions.

import * as THREE from 'three';
import type { Quality } from './quality';

export interface Stage {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  clock: THREE.Clock;
  size: () => { w: number; h: number };
  resize: (w: number, h: number) => void;
}

export function createStage(canvas: HTMLCanvasElement, quality: Quality): Stage {
  // Probe WebGL support up front so we can show a clean fallback instead of crashing
  const probe = document.createElement('canvas').getContext('webgl2')
    || document.createElement('canvas').getContext('webgl');
  if (!probe) {
    showWebGLFallback();
    throw new Error('WebGL unavailable');
  }

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
  } catch (err) {
    showWebGLFallback();
    throw err;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality.dprCap));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050b2e);
  scene.fog = new THREE.FogExp2(0x050b2e, 0.018);

  const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    400
  );
  camera.position.set(0, 0, 8);
  camera.lookAt(0, 0, 0);

  // Ambient + key + rim
  scene.add(new THREE.AmbientLight(0x6080ff, 0.35));
  const key = new THREE.DirectionalLight(0x9fdcff, 1.1);
  key.position.set(6, 10, 8);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x2ec8ff, 0.8);
  rim.position.set(-8, -2, -4);
  scene.add(rim);
  const fill = new THREE.PointLight(0x1f6ee8, 0.6, 80);
  fill.position.set(0, 0, 6);
  scene.add(fill);

  const resize = (w: number, h: number) => {
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };

  return {
    scene,
    camera,
    renderer,
    clock: new THREE.Clock(),
    size: () => ({ w: window.innerWidth, h: window.innerHeight }),
    resize
  };
}

function showWebGLFallback() {
  const canvas = document.getElementById('bg');
  if (canvas) canvas.remove();
  const banner = document.createElement('div');
  banner.style.cssText = [
    'position:fixed', 'top:0', 'left:0', 'right:0',
    'padding:14px 20px', 'background:#1f6ee8', 'color:#fff',
    'font:13px/1.5 system-ui,sans-serif', 'text-align:center', 'z-index:100'
  ].join(';');
  banner.appendChild(document.createTextNode('This site needs WebGL. Enable hardware acceleration in your browser ('));
  const code = document.createElement('code');
  code.textContent = 'chrome://settings/system';
  banner.appendChild(code);
  banner.appendChild(document.createTextNode(' → "Use graphics acceleration") and reload, or open this page in Safari or Firefox.'));
  document.body.prepend(banner);
}
