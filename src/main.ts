// Entry point: bootstrap the stage, build all 3D objects, mount overlays, run the loop.
// Pulls everything together — kept thin; logic lives in scene/timeline/objects modules.

import './styles.css';
import { createStage } from './scene/stage';
import { createPostFx } from './scene/postfx';
import { createAtom } from './objects/atom';
import { createGrid } from './objects/grid';
import { createServices } from './objects/services';
import { createPipeline } from './objects/pipeline';
import { createGlobe } from './objects/globe';
import { createParticleField } from './objects/particles';
import { mountServiceTags } from './ui/overlays';
import { buildTimeline } from './timeline';

const canvas = document.getElementById('bg') as HTMLCanvasElement | null;
if (!canvas) throw new Error('Missing #bg canvas');

const stage = createStage(canvas);
const postfx = createPostFx(stage.renderer, stage.scene, stage.camera);
window.addEventListener('resize', () => postfx.setSize(window.innerWidth, window.innerHeight));

// Build objects
const atom = createAtom();
const grid = createGrid();
const services = createServices();
const pipeline = createPipeline();
const globe = createGlobe();
const field = createParticleField();

// Stage assembly
stage.scene.add(atom.group);
stage.scene.add(grid.group);
stage.scene.add(services.group);
stage.scene.add(pipeline.group);
stage.scene.add(globe.group);
stage.scene.add(field.points);

// DOM overlays
const overlays = mountServiceTags(stage, services.nodes);

// Master scroll timeline
buildTimeline({ stage, atom, grid, services, pipeline, globe });

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
  postfx.composer.render();
  requestAnimationFrame(loop);
}
loop();
