// Entry point: bootstrap the stage, build all 3D objects, mount overlays, run the loop.
// Pulls everything together — kept thin; logic lives in scene/timeline/objects modules.

import './styles.css';
import gsap from 'gsap';
import { createStage } from './scene/stage';
import { createPostFx } from './scene/postfx';
import { detectQuality } from './scene/quality';
import { createAtom } from './objects/atom';
import { createGrid } from './objects/grid';
import { createServices } from './objects/services';
import { createPipeline } from './objects/pipeline';
import { createGlobe } from './objects/globe';
import { createParticleField } from './objects/particles';
import { mountServiceTags } from './ui/overlays';
import { mountServiceDetail } from './ui/service-detail';
import { mountStepDetail } from './ui/step-detail';
import { mountMotionToggle } from './ui/motion-toggle';
import { mountCaseCards } from './ui/case-cards';
import { buildTimeline } from './timeline';
import { initLenis } from './lib/lenis';
import { PROCESS } from './content/process';
import { el } from './lib/dom';

const canvas = document.getElementById('bg') as HTMLCanvasElement | null;
if (!canvas) throw new Error('Missing #bg canvas');

const quality = detectQuality();
const stage = createStage(canvas, quality);
const postfx = createPostFx(stage.renderer, stage.scene, stage.camera, quality);
window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  stage.resize(w, h);
  postfx.setSize(w, h);
});

// Build objects
const atom = createAtom();
const grid = createGrid();
const services = createServices();
const pipeline = createPipeline();
const globe = createGlobe();
const field = createParticleField(quality.particleCount);

// Stage assembly
stage.scene.add(atom.group);
stage.scene.add(grid.group);
stage.scene.add(services.group);
stage.scene.add(pipeline.group);
stage.scene.add(globe.group);
stage.scene.add(field.points);

// DOM overlays
const detail = mountServiceDetail();
const overlays = mountServiceTags(stage, services.nodes, (svc) => detail.open(svc));

// Master scroll timeline + DOF focus state (driven by timeline, read in render loop)
const focus = { distance: 0.05 };
buildTimeline({ stage, atom, grid, services, pipeline, globe, focus });

initLenis();

const motionRoot = document.querySelector<HTMLElement>('.motion-toggle-mount');
if (motionRoot) mountMotionToggle(motionRoot);

const caseRoot = document.querySelector<HTMLElement>('.case-grid');
if (caseRoot) mountCaseCards(caseRoot);

const stepDetail = mountStepDetail();
const stepsRoot = document.querySelector<HTMLElement>('.process-steps');
if (stepsRoot) {
  PROCESS.forEach((step) => {
    const btn = el('button', {
      class: 'step-pill',
      text: step.name,
      attrs: { type: 'button' },
      on: { click: () => stepDetail.open(step) }
    });
    stepsRoot.appendChild(btn);
  });
}

// Render loop
function loop() {
  const t = stage.clock.getElapsedTime();
  atom.tick(t);
  grid.tick(t);
  services.tick(t);
  pipeline.tick(t);
  globe.tick(t);
  field.tick(t);
  overlays.update();
  if (postfx.dof) {
    postfx.dof.cocMaterial.uniforms.focusDistance.value = focus.distance;
  }
  postfx.composer.render();
  requestAnimationFrame(loop);
}
loop();

// Loading intro: atom assembles, loader fades.
gsap.set(atom.group.scale, { x: 0, y: 0, z: 0 });
gsap.set(atom.group.rotation, { y: -1.5 });
const intro = gsap.timeline({
  onComplete: () => document.getElementById('loader')?.classList.add('hidden')
});
intro.to(atom.group.scale, { x: 1, y: 1, z: 1, duration: 1.2, ease: 'expo.out' }, 0.3);
intro.to(atom.group.rotation, { y: 0, duration: 1.2, ease: 'expo.out' }, 0.3);
