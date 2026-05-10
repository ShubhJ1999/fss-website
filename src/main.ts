// Entry point: small. Mounts the hero atom, renders editorial sections,
// wires the form + booking + analytics + SEO JSON-LD. No scroll-driven 3D.

import './styles.css';
import * as THREE from 'three';
import { createStage } from './scene/stage';
import { createPostFx } from './scene/postfx';
import { detectQuality } from './scene/quality';
import { createAtom } from './objects/atom';
import { mountServicesList } from './ui/services-list';
import { mountServiceDetail } from './ui/service-detail';
import { mountProcessList } from './ui/process-list';
import { mountCaseCards } from './ui/case-cards';
import { mountTrustRow } from './ui/trust-row';
import { mountAbout } from './ui/about';
import { mountNotesCards } from './ui/notes-cards';
import { mountTiers } from './ui/tiers';
import { mountForm } from './ui/form';
import { attachCalLinks } from './ui/booking';
import { mountFloatingCta } from './ui/floating-cta';
import { initAnalytics } from './lib/analytics';
import { organizationJsonLd } from './lib/seo';

const canvas = document.getElementById('bg') as HTMLCanvasElement | null;
if (!canvas) throw new Error('Missing #bg canvas');

const quality = detectQuality();
const stage = createStage(canvas, quality);
const postfx = createPostFx(stage.renderer, stage.scene, stage.camera, quality);

// Atom-only scene; the rest of the page is HTML.
const atom = createAtom();
stage.scene.add(atom.group);
stage.camera.position.set(0, 0, 6);
stage.camera.lookAt(new THREE.Vector3(0, 0, 0));

// Resize: keep the hero canvas matched to its container, not the viewport.
const fitCanvas = () => {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (w === 0 || h === 0) return;
  stage.resize(w, h);
  postfx.setSize(w, h);
};
window.addEventListener('resize', fitCanvas);
fitCanvas();

// Render loop
function loop() {
  const t = stage.clock.getElapsedTime();
  atom.tick(t);
  postfx.composer.render();
  requestAnimationFrame(loop);
}
loop();

// Mount editorial sections
const detail = mountServiceDetail();

const caseRoot = document.querySelector<HTMLElement>('.case-grid');
if (caseRoot) mountCaseCards(caseRoot);

const trustRoot = document.querySelector<HTMLElement>('.trust-row');
if (trustRoot) mountTrustRow(trustRoot);

const servicesRoot = document.querySelector<HTMLElement>('.services-list');
if (servicesRoot) mountServicesList(servicesRoot, (svc) => detail.open(svc));

const processRoot = document.querySelector<HTMLElement>('.process-list');
if (processRoot) mountProcessList(processRoot);

const aboutRoot = document.querySelector<HTMLElement>('.about-block');
if (aboutRoot) mountAbout(aboutRoot);

const notesRoot = document.querySelector<HTMLElement>('.notes-grid');
if (notesRoot) mountNotesCards(notesRoot);

const tiersRoot = document.querySelector<HTMLElement>('.tiers-grid');
if (tiersRoot) mountTiers(tiersRoot);

const formRoot = document.querySelector<HTMLElement>('.contact-form-mount');
if (formRoot) mountForm(formRoot, { endpoint: '/api/contact' });

mountFloatingCta('fermion/intro');
attachCalLinks();
initAnalytics();

const orgScript = document.getElementById('org-ld');
if (orgScript) orgScript.textContent = JSON.stringify(organizationJsonLd());
