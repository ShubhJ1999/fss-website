# FSS Site Enhancement — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Take the existing cinematic scroll site from "tutorial-shaped" to a premium boutique studio site that books calls — by adding a custom GLSL hero, scene interactions, conversion content (case studies / form / tiers / booking), and proper SEO/analytics foundations.

**Architecture:** Single persistent three.js scene with one master GSAP/ScrollTrigger timeline (preserved). New layers: `src/content/` for typed content arrays, `src/scene/` split with quality + motion modules, `src/lib/` for cross-cutting helpers (Lenis, reduced motion, SEO, safe DOM), `src/ui/` for new DOM panels and forms, Vite multi-page entries for case studies, and a Cloudflare Pages Function for the contact form.

**Tech Stack:** Vite 5, TypeScript 5.5 (strict), three.js 0.169, GSAP 3.12 + ScrollTrigger, Lenis 1.x, `postprocessing` (pmndrs), Cloudflare Pages + Functions, Resend, Plausible, Cal.com embed, Vitest + Playwright.

**Source spec:** `docs/superpowers/specs/2026-05-09-fss-site-enhancement-design.md`

---

## Phase overview

| Phase | Theme | Tasks | Ships |
|---|---|---|---|
| 1 | Tech foundation | 1–8 | Lenis, postfx, quality + motion modules, mobile config, safe-DOM helper |
| 2 | Hero / atom upgrade | 9–13 | GLSL fermion shader, scroll-DOF, loading intro |
| 3 | Scene upgrades | 14–18 | BatchedMesh constellation, click-to-detail panels, globe continents + arcs |
| 4 | Content + pages | 19–23 | Content modules, multi-page setup, case study template, 404 page, trust row |
| 5 | Conversion | 24–29 | Tiers, contact form + Pages Function, Cal.com booking, analytics |
| 6 | Launch | 30–34 | SEO + OG, sitemap, Lighthouse CI, Playwright smoke, deploy |

Each phase ends green: TypeScript builds, dev server runs, no console errors. Manual visual QA between phases.

---

## Conventions for this plan

- Every `.ts` file starts with two comment lines describing what it is and why.
- No `any`. Strict TypeScript everywhere.
- Files under 300 lines — split when growing.
- TDD where it pays: form validation, content shape guards, motion mode logic, SEO helpers, quality detection. Visual / shader / scene work is validated by browser QA — no useful tests there.
- **Never use `innerHTML` for dynamic content.** Use the `el()` and `tree()` helpers from `src/lib/dom.ts` (built in Task 1). Static template strings without interpolation are fine but discouraged.
- Commit at the end of every task. Use the message provided.
- After every task, run `npm run build` to confirm types still compile and `npm run dev` to spot-check the change in `http://localhost:5173`.

---

# Phase 1 — Tech Foundation

## Task 1: Add Vitest + safe-DOM helper

**Why:** TDD tasks downstream need a test runner, and every UI module downstream needs the safe DOM helper to avoid `innerHTML`.

**Files:**
- Create: `vitest.config.ts`
- Create: `src/lib/dom.ts`
- Create: `tests/dom.test.ts`
- Modify: `package.json`
- Modify: `tsconfig.json`

- [ ] **Step 1: Install Vitest + happy-dom**

```bash
npm install -D vitest @vitest/ui happy-dom
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
// Vitest config — runs unit tests under tests/ in a happy-dom environment.
// Kept separate from vite.config.ts so prod build stays untouched.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['tests/**/*.test.ts']
  }
});
```

- [ ] **Step 3: Add scripts + types**

In `package.json` `scripts`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

In `tsconfig.json` `compilerOptions`:

```json
"types": ["vitest/globals"]
```

- [ ] **Step 4: Failing test for `el()` and `tree()`**

```ts
// tests/dom.test.ts
import { describe, it, expect } from 'vitest';
import { el, tree } from '../src/lib/dom';

describe('el', () => {
  it('creates element with text + class', () => {
    const e = el('p', { class: 'foo', text: 'hi' });
    expect(e.tagName).toBe('P');
    expect(e.className).toBe('foo');
    expect(e.textContent).toBe('hi');
  });

  it('escapes injected text — never parses HTML', () => {
    const e = el('span', { text: '<script>alert(1)</script>' });
    expect(e.textContent).toBe('<script>alert(1)</script>');
    expect(e.querySelector('script')).toBe(null);
  });

  it('sets attributes', () => {
    const e = el('a', { attrs: { href: '/x', 'data-id': '7' } });
    expect(e.getAttribute('href')).toBe('/x');
    expect(e.dataset.id).toBe('7');
  });
});

describe('tree', () => {
  it('builds nested structures', () => {
    const root = tree('div', { class: 'wrap' }, [
      el('h2', { text: 'title' }),
      tree('ul', {}, [el('li', { text: 'one' }), el('li', { text: 'two' })])
    ]);
    expect(root.querySelector('h2')?.textContent).toBe('title');
    expect(root.querySelectorAll('li').length).toBe(2);
  });
});
```

- [ ] **Step 5: Run — fail**

Run: `npm run test`
Expected: FAIL — module not found.

- [ ] **Step 6: Implement `src/lib/dom.ts`**

```ts
// Safe DOM construction helpers. Always use these instead of innerHTML for
// dynamic content — text passes through textContent, never parsed as HTML.

type ElOpts = {
  class?: string;
  text?: string;
  attrs?: Record<string, string>;
  on?: Partial<{ click: (e: MouseEvent) => void; submit: (e: SubmitEvent) => void }>;
};

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  opts: ElOpts = {}
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (opts.class) node.className = opts.class;
  if (opts.text != null) node.textContent = opts.text;
  if (opts.attrs) {
    for (const [k, v] of Object.entries(opts.attrs)) node.setAttribute(k, v);
  }
  if (opts.on?.click) node.addEventListener('click', opts.on.click);
  if (opts.on?.submit) node.addEventListener('submit', opts.on.submit as EventListener);
  return node;
}

export function tree<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  opts: ElOpts,
  children: Array<Node | string>
): HTMLElementTagNameMap[K] {
  const root = el(tag, opts);
  for (const c of children) {
    root.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return root;
}

export function clear(node: Element): void {
  while (node.firstChild) node.removeChild(node.firstChild);
}
```

- [ ] **Step 7: Run — pass**

Run: `npm run test`
Expected: 4 passing.

- [ ] **Step 8: Commit**

```bash
git add vitest.config.ts src/lib/dom.ts tests/dom.test.ts package.json package-lock.json tsconfig.json
git commit -m "chore: Vitest harness + safe-DOM helpers (el/tree/clear)"
```

---

## Task 2: Split `scene.ts` → `scene/stage.ts` + `scene/postfx.ts`

**Why:** `scene.ts` will grow past 300 lines once postfx + quality + motion land. Split now along the natural seam.

**Files:**
- Create: `src/scene/stage.ts`
- Create: `src/scene/postfx.ts`
- Modify: `src/scene.ts` (becomes a re-export)
- Modify: `src/main.ts`

- [ ] **Step 1: Create `src/scene/stage.ts`**

Move everything from `src/scene.ts` EXCEPT the `EffectComposer` setup. Keep `Stage` interface, `createStage()`, `showWebGLFallback()`. Drop the `composer` field from `Stage`.

```ts
// Three.js stage: renderer, scene, camera, lights.
// One persistent scene reused across all scroll-driven scene-regions.

import * as THREE from 'three';

export interface Stage {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  clock: THREE.Clock;
  size: () => { w: number; h: number };
}

export function createStage(canvas: HTMLCanvasElement): Stage {
  const probe = document.createElement('canvas').getContext('webgl2')
    || document.createElement('canvas').getContext('webgl');
  if (!probe) {
    showWebGLFallback();
    throw new Error('WebGL unavailable');
  }

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, alpha: false, powerPreference: 'high-performance'
    });
  } catch (err) {
    showWebGLFallback();
    throw err;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050b2e);
  scene.fog = new THREE.FogExp2(0x050b2e, 0.018);

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 400);
  camera.position.set(0, 0, 8);
  camera.lookAt(0, 0, 0);

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

  const onResize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };
  window.addEventListener('resize', onResize);

  return {
    scene, camera, renderer,
    clock: new THREE.Clock(),
    size: () => ({ w: window.innerWidth, h: window.innerHeight })
  };
}

function showWebGLFallback() {
  const canvas = document.getElementById('bg');
  if (canvas) canvas.remove();
  const banner = document.createElement('div');
  banner.style.cssText = 'position:fixed;top:0;left:0;right:0;padding:14px 20px;background:#1f6ee8;color:#fff;font:13px/1.5 system-ui,sans-serif;text-align:center;z-index:100';
  banner.textContent = 'This site needs WebGL. Enable hardware acceleration in your browser, or open this page in Safari or Firefox.';
  document.body.prepend(banner);
}
```

- [ ] **Step 2: Create `src/scene/postfx.ts`** (still using UnrealBloomPass; we migrate in Task 5)

```ts
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
    0.65, 0.7, 0.18
  ));
  return { composer, setSize: (w, h) => composer.setSize(w, h) };
}
```

- [ ] **Step 3: Replace `src/scene.ts` with a re-export**

```ts
// Backwards-compat re-export. New code should import from './scene/stage' or './scene/postfx'.
export { createStage } from './scene/stage';
export type { Stage } from './scene/stage';
```

- [ ] **Step 4: Wire postfx into `src/main.ts`**

In `src/main.ts`, replace the import line:

```ts
import { createStage } from './scene';
```

with:

```ts
import { createStage } from './scene/stage';
import { createPostFx } from './scene/postfx';
```

After `const stage = createStage(canvas);`, add:

```ts
const postfx = createPostFx(stage.renderer, stage.scene, stage.camera);
window.addEventListener('resize', () => postfx.setSize(window.innerWidth, window.innerHeight));
```

In `loop()`, replace `stage.composer.render();` with `postfx.composer.render();`.

- [ ] **Step 5: Build + dev**

```bash
npm run build
npm run dev
```

Expected: site identical to before. Atom glows, scroll choreography intact.

- [ ] **Step 6: Commit**

```bash
git add src/scene src/scene.ts src/main.ts
git commit -m "refactor: split scene.ts into scene/stage + scene/postfx"
```

---

## Task 3: Add `src/scene/quality.ts` — device tier + quality config

**Files:**
- Create: `src/scene/quality.ts`
- Create: `tests/quality.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// tests/quality.test.ts
import { describe, it, expect, vi } from 'vitest';
import { detectQuality } from '../src/scene/quality';

describe('detectQuality', () => {
  it('returns mobile tier when viewport <= 720px', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('max-width: 720px'), media: q,
      addEventListener: () => {}, removeEventListener: () => {}
    }));
    Object.defineProperty(navigator, 'hardwareConcurrency', { value: 8, configurable: true });
    const q = detectQuality();
    expect(q.tier).toBe('mobile');
    expect(q.bloomEnabled).toBe(false);
    expect(q.dprCap).toBeLessThanOrEqual(1.5);
  });

  it('returns low tier when hardwareConcurrency < 4 on desktop', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: false, media: q,
      addEventListener: () => {}, removeEventListener: () => {}
    }));
    Object.defineProperty(navigator, 'hardwareConcurrency', { value: 2, configurable: true });
    const q = detectQuality();
    expect(q.tier).toBe('low');
    expect(q.bloomEnabled).toBe(true);
    expect(q.dofEnabled).toBe(false);
  });

  it('returns high tier on a normal desktop', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: false, media: q,
      addEventListener: () => {}, removeEventListener: () => {}
    }));
    Object.defineProperty(navigator, 'hardwareConcurrency', { value: 8, configurable: true });
    const q = detectQuality();
    expect(q.tier).toBe('high');
    expect(q.bloomEnabled).toBe(true);
    expect(q.dofEnabled).toBe(true);
    expect(q.particleCount).toBeGreaterThanOrEqual(1000);
  });
});
```

- [ ] **Step 2: Run — fail**

Run: `npm run test`

- [ ] **Step 3: Implement `src/scene/quality.ts`**

```ts
// Device tier detection + per-tier render quality config.
// Selected once at boot; renderer + objects branch on this struct.

export type Tier = 'mobile' | 'low' | 'mid' | 'high';

export interface Quality {
  tier: Tier;
  dprCap: number;
  particleCount: number;
  bloomEnabled: boolean;
  dofEnabled: boolean;
  chromaticEnabled: boolean;
}

export function detectQuality(): Quality {
  const isMobile = window.matchMedia('(max-width: 720px)').matches;
  const cores = navigator.hardwareConcurrency ?? 4;

  if (isMobile) {
    return { tier: 'mobile', dprCap: 1.5, particleCount: 400,
             bloomEnabled: false, dofEnabled: false, chromaticEnabled: false };
  }
  if (cores < 4) {
    return { tier: 'low', dprCap: 1.5, particleCount: 700,
             bloomEnabled: true, dofEnabled: false, chromaticEnabled: false };
  }
  if (cores < 8) {
    return { tier: 'mid', dprCap: 2, particleCount: 1200,
             bloomEnabled: true, dofEnabled: true, chromaticEnabled: false };
  }
  return { tier: 'high', dprCap: 2, particleCount: 1400,
           bloomEnabled: true, dofEnabled: true, chromaticEnabled: true };
}
```

- [ ] **Step 4: Run — pass**

Run: `npm run test`

- [ ] **Step 5: Commit**

```bash
git add src/scene/quality.ts tests/quality.test.ts
git commit -m "feat(scene): quality tier detection"
```

---

## Task 4: Add `src/scene/motion.ts` — reduced motion + persistence

**Files:**
- Create: `src/scene/motion.ts`
- Create: `tests/motion.test.ts`

- [ ] **Step 1: Failing test**

```ts
// tests/motion.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getMotionMode, setMotionMode, onMotionChange } from '../src/scene/motion';

describe('motion mode', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: false, media: q,
      addEventListener: () => {}, removeEventListener: () => {}
    }));
  });

  it('defaults to full when no OS preference and no localStorage', () => {
    expect(getMotionMode()).toBe('full');
  });

  it('respects prefers-reduced-motion', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('reduce'), media: q,
      addEventListener: () => {}, removeEventListener: () => {}
    }));
    expect(getMotionMode()).toBe('reduced');
  });

  it('lets manual override beat OS preference', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('reduce'), media: q,
      addEventListener: () => {}, removeEventListener: () => {}
    }));
    setMotionMode('full');
    expect(getMotionMode()).toBe('full');
  });

  it('notifies subscribers on setMotionMode', () => {
    const cb = vi.fn();
    onMotionChange(cb);
    setMotionMode('reduced');
    expect(cb).toHaveBeenCalledWith('reduced');
  });
});
```

- [ ] **Step 2: Run — fail**

Run: `npm run test`

- [ ] **Step 3: Implement `src/scene/motion.ts`**

```ts
// Reduced-motion mode: OS prefs + manual override (localStorage).
// Subscribed to by timeline.ts to choose scrub-vs-static rendering.

export type MotionMode = 'full' | 'reduced';

const STORAGE_KEY = 'fss:motion-mode';
const listeners = new Set<(mode: MotionMode) => void>();

export function getMotionMode(): MotionMode {
  const manual = localStorage.getItem(STORAGE_KEY) as MotionMode | null;
  if (manual === 'full' || manual === 'reduced') return manual;
  const os = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return os ? 'reduced' : 'full';
}

export function setMotionMode(mode: MotionMode): void {
  localStorage.setItem(STORAGE_KEY, mode);
  listeners.forEach((l) => l(mode));
}

export function onMotionChange(cb: (mode: MotionMode) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
```

- [ ] **Step 4: Run — pass**

Run: `npm run test`

- [ ] **Step 5: Commit**

```bash
git add src/scene/motion.ts tests/motion.test.ts
git commit -m "feat(scene): reduced-motion mode with manual override"
```

---

## Task 5: Migrate UnrealBloomPass → pmndrs/postprocessing

**Why:** Single merged pass, perf win, cheap addition of DOF + chromatic later.

**Files:**
- Modify: `src/scene/postfx.ts`
- Modify: `src/main.ts`
- Modify: `package.json`

- [ ] **Step 1: Install**

```bash
npm install postprocessing
```

- [ ] **Step 2: Rewrite `src/scene/postfx.ts`**

```ts
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
```

- [ ] **Step 3: Wire quality through `main.ts`**

Add at top of `main.ts`:

```ts
import { detectQuality } from './scene/quality';
const quality = detectQuality();
```

Update the postfx call:

```ts
const postfx = createPostFx(stage.renderer, stage.scene, stage.camera, quality);
```

- [ ] **Step 4: Build + browser QA**

```bash
npm run build
npm run dev
```

Expected: bloom still glows on the atom; identical or near-identical to UnrealBloom output. No console errors.

- [ ] **Step 5: Commit**

```bash
git add src/scene/postfx.ts src/main.ts package.json package-lock.json
git commit -m "perf(scene): migrate to pmndrs/postprocessing single-pass composer"
```

---

## Task 6: Add Lenis smooth scroll

**Files:**
- Create: `src/lib/lenis.ts`
- Modify: `src/main.ts`
- Modify: `package.json`

- [ ] **Step 1: Install**

```bash
npm install lenis
```

- [ ] **Step 2: Create `src/lib/lenis.ts`**

```ts
// Lenis smooth-scroll integration. Drives GSAP's RAF so ScrollTrigger stays in sync.
// Disabled when motion mode = reduced.

import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getMotionMode } from '../scene/motion';

export interface LenisHandle { destroy: () => void; }

export function initLenis(): LenisHandle | null {
  if (getMotionMode() === 'reduced') return null;

  const lenis = new Lenis({ duration: 1.2, smoothWheel: true, syncTouch: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return { destroy: () => lenis.destroy() };
}
```

- [ ] **Step 3: Wire into `main.ts`**

Add import:
```ts
import { initLenis } from './lib/lenis';
```

After `buildTimeline(...)`:
```ts
initLenis();
```

- [ ] **Step 4: Browser QA**

Run: `npm run dev`. Scroll the page.
Expected: noticeably smoother scroll feel. ScrollTrigger choreography still works.

- [ ] **Step 5: Commit**

```bash
git add src/lib/lenis.ts src/main.ts package.json package-lock.json
git commit -m "feat: Lenis smooth scroll wired through GSAP ticker"
```

---

## Task 7: Wire mobile config into stage + particles

**Files:**
- Modify: `src/scene/stage.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Update `createStage` to accept Quality**

In `src/scene/stage.ts`, add import:
```ts
import type { Quality } from './quality';
```

Change signature:
```ts
export function createStage(canvas: HTMLCanvasElement, quality: Quality): Stage {
```

Replace existing `setPixelRatio` line with:
```ts
renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality.dprCap));
```

- [ ] **Step 2: Update `main.ts`**

Replace `const stage = createStage(canvas);` with:
```ts
const stage = createStage(canvas, quality);
```

Replace `const field = createParticleField();` with:
```ts
const field = createParticleField(quality.particleCount);
```

- [ ] **Step 3: Browser QA**

Run: `npm run dev`. Open Chrome DevTools → Device Toolbar → iPhone 14 Pro → reload.
Expected: site renders without bloom (lower density), 400 particles, smooth FPS.

- [ ] **Step 4: Commit**

```bash
git add src/scene/stage.ts src/main.ts
git commit -m "feat(scene): wire quality config into stage + particle count"
```

---

## Task 8: Reduced-motion timeline path + footer toggle

**Files:**
- Modify: `src/timeline.ts`
- Create: `src/ui/motion-toggle.ts`
- Modify: `src/main.ts`
- Modify: `index.html`
- Modify: `src/styles.css`

- [ ] **Step 1: Update `timeline.ts` to branch on motion mode**

At top of file:
```ts
import { getMotionMode } from './scene/motion';
```

Inside `buildTimeline`, after `const lookAt = new THREE.Vector3(0, 0, 0);` block and `applyLookAt` setup, replace the existing `gsap.timeline({...})` initialisation with:

```ts
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
  scrollTrigger: { trigger: '#scroll', start: 'top top', end: 'bottom bottom', scrub: 1 },
  onUpdate: applyLookAt
});
```

Update return type to `gsap.core.Timeline | null`.

- [ ] **Step 2: Create `src/ui/motion-toggle.ts`**

```ts
// Footer "reduce motion" toggle. Persists via setMotionMode; reload required
// so timeline rebuilds.

import { el } from '../lib/dom';
import { getMotionMode, setMotionMode } from '../scene/motion';

export function mountMotionToggle(root: HTMLElement): void {
  const btn = el('button', {
    class: 'motion-toggle',
    attrs: { type: 'button' },
    on: { click: () => {
      const next = getMotionMode() === 'reduced' ? 'full' : 'reduced';
      setMotionMode(next);
      location.reload();
    }}
  });
  const render = () => {
    const mode = getMotionMode();
    btn.textContent = mode === 'reduced' ? 'Restore motion' : 'Reduce motion';
    btn.setAttribute('aria-pressed', String(mode === 'reduced'));
  };
  render();
  root.appendChild(btn);
}
```

- [ ] **Step 3: Add hook in `index.html`**

In the `contact` scene's `.copy` div, replace `<span class="footnote">© Fermion Software Solutions</span>` with:

```html
<div class="footer-row">
  <span class="footnote">© Fermion Software Solutions</span>
  <span class="motion-toggle-mount" aria-label="Motion preference"></span>
</div>
```

- [ ] **Step 4: CSS**

Append to `src/styles.css`:

```css
.footer-row {
  display: flex; justify-content: center; gap: 24px;
  margin-top: 48px; align-items: center;
}
.motion-toggle {
  background: transparent;
  border: 1px solid var(--rule);
  color: var(--ink-dim);
  font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase;
  padding: 6px 12px; border-radius: 999px;
  cursor: pointer; pointer-events: auto;
  transition: color 0.2s, border-color 0.2s;
}
.motion-toggle:hover { color: var(--cyan); border-color: var(--cyan); }
```

- [ ] **Step 5: Mount in `main.ts`**

```ts
import { mountMotionToggle } from './ui/motion-toggle';
const motionRoot = document.querySelector<HTMLElement>('.motion-toggle-mount');
if (motionRoot) mountMotionToggle(motionRoot);
```

- [ ] **Step 6: QA**

Run: `npm run dev`. Scroll to bottom, toggle visible. Click "Reduce motion" → reload → all scenes visible at once. Toggle back → scrub returns.

- [ ] **Step 7: Commit**

```bash
git add src/timeline.ts src/ui/motion-toggle.ts src/main.ts index.html src/styles.css
git commit -m "feat(a11y): reduced-motion path + footer toggle"
```

---

# Phase 2 — Hero / Atom Upgrade

## Task 9: GLSL fermion shader — material + uniforms

**Files:**
- Create: `src/objects/atom-shader/atom.vert.glsl`
- Create: `src/objects/atom-shader/atom.frag.glsl`
- Create: `src/objects/atom-shader/material.ts`
- Create: `src/glsl.d.ts`
- Modify: `vite.config.ts`
- Modify: `package.json`

- [ ] **Step 1: Install GLSL plugin**

```bash
npm install -D vite-plugin-glsl
```

- [ ] **Step 2: Update `vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  base: './',
  plugins: [glsl()],
  server: { port: 5173, open: false },
  build: { target: 'es2022', sourcemap: true }
});
```

- [ ] **Step 3: Vertex shader**

`src/objects/atom-shader/atom.vert.glsl`:

```glsl
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vPosition;
uniform float uTime;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

void main() {
  vec3 p = position;
  float n = hash(floor(p * 4.0 + uTime * 0.4));
  p += normal * (sin(uTime * 1.2 + n * 6.28) * 0.04);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vViewDir = normalize(-mv.xyz);
  vPosition = p;
  gl_Position = projectionMatrix * mv;
}
```

- [ ] **Step 4: Fragment shader**

`src/objects/atom-shader/atom.frag.glsl`:

```glsl
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vPosition;

uniform float uTime;
uniform vec3 uCoreColor;
uniform vec3 uRimColor;

void main() {
  float fres = pow(1.0 - max(0.0, dot(vNormal, vViewDir)), 2.4);
  float bands = sin(vPosition.y * 8.0 + uTime * 2.0) * 0.5 + 0.5;
  float swirl = sin(vPosition.x * 6.0 + vPosition.z * 6.0 + uTime * 1.4) * 0.5 + 0.5;
  vec3 core = uCoreColor * (0.5 + 0.5 * mix(bands, swirl, 0.5));
  vec3 col = mix(core, uRimColor, fres);
  gl_FragColor = vec4(col, 1.0);
}
```

- [ ] **Step 5: Material factory**

`src/objects/atom-shader/material.ts`:

```ts
// Fermion shader material. Driven by a single uTime uniform.

import * as THREE from 'three';
import vert from './atom.vert.glsl';
import frag from './atom.frag.glsl';

export interface FermionMaterial {
  material: THREE.ShaderMaterial;
  tick: (t: number) => void;
}

export function createFermionMaterial(): FermionMaterial {
  const material = new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    uniforms: {
      uTime: { value: 0 },
      uCoreColor: { value: new THREE.Color(0x2ec8ff) },
      uRimColor:  { value: new THREE.Color(0x6fdcff) }
    }
  });
  return { material, tick: (t) => { material.uniforms.uTime.value = t; } };
}
```

- [ ] **Step 6: Type declaration**

`src/glsl.d.ts`:

```ts
declare module '*.glsl' {
  const content: string;
  export default content;
}
```

- [ ] **Step 7: Build to verify GLSL compiles**

Run: `npm run build`
Expected: bundle succeeds.

- [ ] **Step 8: Commit**

```bash
git add src/objects/atom-shader src/glsl.d.ts vite.config.ts package.json package-lock.json
git commit -m "feat(atom): fermion GLSL shader material"
```

---

## Task 10: Replace icosahedron material in `atom.ts`

**Files:**
- Modify: `src/objects/atom.ts`

- [ ] **Step 1: Swap material**

In `src/objects/atom.ts`, add import at top:

```ts
import { createFermionMaterial } from './atom-shader/material';
```

Remove the existing `coreMat` block. Replace the core mesh creation with:

```ts
const fermion = createFermionMaterial();
const coreGeo = new THREE.SphereGeometry(0.55, 64, 64);
const core = new THREE.Mesh(coreGeo, fermion.material);
group.add(core);
```

In the `tick` function, replace existing `core.rotation.*` lines with:

```ts
fermion.tick(t);
core.rotation.y = t * 0.15;
```

- [ ] **Step 2: Browser QA**

Run: `npm run dev`. Scroll to top.
Expected: animated energy-shell shimmer + bright fresnel rim, instead of the old bloomed icosahedron.

- [ ] **Step 3: Commit**

```bash
git add src/objects/atom.ts
git commit -m "feat(atom): replace icosahedron with GLSL fermion material"
```

---

## Task 11: Scroll-driven depth-of-field

**Files:**
- Modify: `src/scene/postfx.ts`
- Modify: `src/main.ts`
- Modify: `src/timeline.ts`

- [ ] **Step 1: Add DOF effect**

In `src/scene/postfx.ts`, expand imports:

```ts
import {
  EffectComposer, RenderPass, EffectPass,
  BloomEffect, DepthOfFieldEffect,
  BlendFunction, KernelSize
} from 'postprocessing';
```

Update `PostFx` interface:

```ts
export interface PostFx {
  composer: EffectComposer;
  setSize: (w: number, h: number) => void;
  dof: DepthOfFieldEffect | null;
}
```

After the bloom block, before `return`:

```ts
let dof: DepthOfFieldEffect | null = null;
if (quality.dofEnabled) {
  dof = new DepthOfFieldEffect(camera, {
    focusDistance: 0.0,
    focalLength: 0.05,
    bokehScale: 2.0
  });
  composer.addPass(new EffectPass(camera, dof));
}

return { composer, setSize: (w, h) => composer.setSize(w, h), dof };
```

- [ ] **Step 2: Expose focus target in timeline**

Modify `src/timeline.ts` `SceneRefs` interface:

```ts
export interface SceneRefs {
  stage: Stage;
  atom: Atom;
  grid: Grid;
  services: ServiceConstellation;
  pipeline: Pipeline;
  globe: Globe;
  focus: { distance: number };
}
```

In each major tween block (where camera.position is animated at labels 0-9), add a `focus` tween. Suggested values:
- Label 0 (hero): `0.05`
- Label 1 (intro): `0.08`
- Label 2-4 (services): `0.1`
- Label 5-6 (pipeline): `0.08`
- Label 7-8 (globe): `0.05`
- Label 9 (contact): `0.18`

Example tween (insert at label 2):
```ts
tl.to(refs.focus, { distance: 0.1, duration: 1, ease: 'power2.inOut' }, 2);
```

- [ ] **Step 3: Wire focus through `main.ts`**

```ts
const focus = { distance: 0.05 };
buildTimeline({ stage, atom, grid, services, pipeline, globe, focus });
```

In the render loop, before `postfx.composer.render();`:

```ts
if (postfx.dof) {
  postfx.dof.cocMaterial.uniforms.focusDistance.value = focus.distance;
}
```

- [ ] **Step 4: Browser QA**

Run: `npm run dev`. Scroll through.
Expected: distant elements blur during transitions; sharp on the active scene. If too aggressive, halve `bokehScale`.

- [ ] **Step 5: Commit**

```bash
git add src/scene/postfx.ts src/timeline.ts src/main.ts
git commit -m "feat(scene): scroll-driven depth-of-field"
```

---

## Task 12: Loading intro sequence (atom assembles)

**Files:**
- Modify: `src/main.ts`
- Modify: `src/styles.css`
- Modify: `index.html`

- [ ] **Step 1: Add loading overlay to `index.html`**

Inside `<body>`, immediately after `<canvas id="bg"></canvas>`:

```html
<div id="loader" aria-hidden="true">
  <div class="loader-pulse"></div>
</div>
```

- [ ] **Step 2: Loader CSS**

Append to `src/styles.css`:

```css
#loader {
  position: fixed; inset: 0; background: var(--bg);
  z-index: 50; display: flex; align-items: center; justify-content: center;
  transition: opacity 0.6s ease;
}
#loader.hidden { opacity: 0; pointer-events: none; }
.loader-pulse {
  width: 14px; height: 14px;
  background: var(--cyan-soft);
  border-radius: 50%;
  box-shadow: 0 0 24px var(--cyan);
  animation: loader-bob 1.2s ease-in-out infinite;
}
@keyframes loader-bob {
  0%, 100% { transform: scale(0.6); opacity: 0.5; }
  50%      { transform: scale(1.4); opacity: 1; }
}
```

- [ ] **Step 3: Atom-assemble in `main.ts`**

After the first `requestAnimationFrame(loop)` line, add:

```ts
gsap.set(atom.group.scale, { x: 0, y: 0, z: 0 });
gsap.set(atom.group.rotation, { y: -1.5 });
const intro = gsap.timeline({
  onComplete: () => document.getElementById('loader')?.classList.add('hidden')
});
intro.to(atom.group.scale, { x: 1, y: 1, z: 1, duration: 1.2, ease: 'expo.out' }, 0.3);
intro.to(atom.group.rotation, { y: 0, duration: 1.2, ease: 'expo.out' }, 0.3);
```

(Add `import gsap from 'gsap';` if not present.)

- [ ] **Step 4: QA**

Hard reload `http://localhost:5173`. Expected: brief navy + cyan pulse → loader fades, atom snaps in.

- [ ] **Step 5: Commit**

```bash
git add src/main.ts src/styles.css index.html
git commit -m "feat: loading intro sequence (atom assemble + loader fade)"
```

---

## Task 13: Phase 2 visual QA + tune

**No code change task — discipline gate.**

- [ ] **Step 1:** Walk through entire scroll on desktop Chrome. Note artifacts (banding, dim core, blown-out rim), DOF too strong/weak per scene, Lenis-vs-scrub feel, FPS drops.
- [ ] **Step 2:** Repeat on iPhone simulator (Safari) and Android emulator if available.
- [ ] **Step 3:** Tune `atom.frag.glsl` constants and per-scene `focus.distance` values.
- [ ] **Step 4:** Commit any tuning changes.

```bash
git add -p
git commit -m "tune: Phase 2 visual polish"
```

---

# Phase 3 — Scene Upgrades

## Task 14: Move services data → `src/content/services.ts`

**Files:**
- Create: `src/content/services.ts`
- Modify: `src/objects/services.ts`
- Create: `tests/content-shape.test.ts`
- Modify: `src/ui/overlays.ts`

- [ ] **Step 1: Failing test**

```ts
// tests/content-shape.test.ts
import { describe, it, expect } from 'vitest';
import { SERVICES } from '../src/content/services';

describe('SERVICES content', () => {
  it('every service has required fields', () => {
    for (const s of SERVICES) {
      expect(s.slug).toMatch(/^[a-z0-9-]+$/);
      expect(s.name).toBeTruthy();
      expect(['Build', 'Run', 'Grow']).toContain(s.cluster);
      expect(s.blurb).toBeTruthy();
      expect(s.body.length).toBeGreaterThan(0);
      expect(s.stack.length).toBeGreaterThan(0);
      expect(s.timeline).toBeTruthy();
    }
  });
  it('slugs are unique', () => {
    const slugs = SERVICES.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
```

- [ ] **Step 2: Run — fail**

Run: `npm run test`

- [ ] **Step 3: Implement `src/content/services.ts`**

```ts
// Service catalogue: name + cluster (used by 3D constellation) and detail content.
// Single source of truth — no duplicate inline arrays anywhere else.

export type ServiceCluster = 'Build' | 'Run' | 'Grow';

export interface Service {
  slug: string;
  name: string;
  cluster: ServiceCluster;
  blurb: string;
  body: string[];
  stack: string[];
  timeline: string;
  sample?: { name: string; href: string };
}

export const SERVICES: Service[] = [
  { slug: 'custom-software', name: 'Custom Software', cluster: 'Build',
    blurb: 'Bespoke web and back-end systems built around your operations.',
    body: [
      'When the off-the-shelf tools end, we step in. Internal dashboards, customer portals, integrations between SaaS systems that don\'t talk to each other, custom logic on top of Stripe / HubSpot / Notion.',
      'Tech is decided by the problem, not by what we already know. Typical stack: TypeScript end-to-end, Postgres, edge-deployed APIs.'
    ],
    stack: ['TypeScript', 'Next.js', 'Postgres', 'Cloudflare Workers'],
    timeline: '4 — 8 weeks' },
  { slug: 'ui-ux-design', name: 'UI / UX Design', cluster: 'Build',
    blurb: 'Product design that ships, by engineers who design.',
    body: ['Product flows, interface design, prototyping. Output is Figma plus a clear spec, not a brand book.',
           'We design with the build in mind — no design-something-then-can\'t-implement theatre.'],
    stack: ['Figma', 'Tailwind tokens', 'Framer'],
    timeline: '1 — 3 weeks' },
  { slug: 'cms-development', name: 'CMS Development', cluster: 'Build',
    blurb: 'Headless CMS setups your team can actually edit.',
    body: ['Sanity, Payload, Strapi, or hand-rolled when warranted. Schemas designed around the content team\'s real workflow.',
           'Includes editor onboarding and a doc you can hand a junior PM.'],
    stack: ['Sanity', 'Payload', 'Strapi'],
    timeline: '2 — 4 weeks' },
  { slug: 'blockchain', name: 'Blockchain Solutions', cluster: 'Build',
    blurb: 'Smart contracts and on-chain integrations when the use case is real.',
    body: ['We don\'t do blockchain-for-the-sake-of. Payments, traceability, NFT-as-receipt, L2 integration when the alternative truly is worse.'],
    stack: ['Solidity', 'Hardhat', 'Viem', 'Optimism / Base'],
    timeline: '4 — 10 weeks' },
  { slug: 'machine-learning', name: 'Machine Learning', cluster: 'Build',
    blurb: 'Production ML — pipelines, fine-tunes, retrieval, evaluation.',
    body: ['From RAG over your own corpus to fine-tuned classifiers running on a Pi. We focus on shipping models that pay for themselves.'],
    stack: ['Python', 'PyTorch', 'Anthropic / OpenAI APIs', 'Vector DBs'],
    timeline: '3 — 8 weeks' },
  { slug: 'api-testing', name: 'API Testing', cluster: 'Run',
    blurb: 'Contract, load, and chaos testing for systems you can\'t afford to ship broken.',
    body: ['Postman / Newman, k6, Pact, hand-rolled. Test plan into CI so it stays honest.'],
    stack: ['k6', 'Pact', 'Postman / Newman', 'GitHub Actions'],
    timeline: '1 — 2 weeks' },
  { slug: 'cloud-hosting', name: 'Cloud Hosting', cluster: 'Run',
    blurb: 'Hosting that doesn\'t become a side-project of its own.',
    body: ['Cloudflare Pages, Fly.io, Render, AWS when the constraint is real. Includes monitoring and a runbook.'],
    stack: ['Cloudflare', 'Fly.io', 'Terraform'],
    timeline: 'Ongoing' },
  { slug: 'cloud-solutions', name: 'Cloud Solutions', cluster: 'Run',
    blurb: 'AWS / GCP / Azure architecture, IaC, migrations.',
    body: ['Greenfield architectures, lift-and-shift migrations, FinOps cleanups when the bill becomes the problem.'],
    stack: ['AWS', 'Terraform', 'Pulumi'],
    timeline: '2 — 6 weeks' },
  { slug: 'serverless', name: 'Serverless', cluster: 'Run',
    blurb: 'Edge functions, Lambdas, queues — without the operational tax.',
    body: ['Workers, Lambdas, Durable Objects. Built for cold-start, observability, and cost discipline from day one.'],
    stack: ['Cloudflare Workers', 'AWS Lambda', 'Durable Objects'],
    timeline: '1 — 3 weeks' },
  { slug: 'remote-hosting', name: 'Remote Hosting', cluster: 'Run',
    blurb: 'Self-hosted apps on infra you own.',
    body: ['Coolify, Dokku, Caprover, or plain docker-compose on a VPS — when SOC compliance or cost demands it.'],
    stack: ['Coolify', 'Hetzner', 'Tailscale'],
    timeline: '1 — 2 weeks' },
  { slug: 'remote-infrastructure', name: 'Remote Infrastructure', cluster: 'Run',
    blurb: 'Networking, VPN, observability for distributed teams.',
    body: ['Tailscale meshes, secret management, log/metric pipelines. The plumbing nobody wants to own.'],
    stack: ['Tailscale', 'Grafana', 'Loki', 'Vault'],
    timeline: '1 — 3 weeks' },
  { slug: 'rpa', name: 'Robotic Process Automation', cluster: 'Grow',
    blurb: 'Automate the manual workflows that drain ops teams.',
    body: ['Playwright + scheduled jobs, Zapier when right-sized, custom orchestration when not. Each automation comes with a rollback story.'],
    stack: ['Playwright', 'n8n', 'Temporal'],
    timeline: '1 — 4 weeks' },
  { slug: 'marketing', name: 'Marketing', cluster: 'Grow',
    blurb: 'Lead-gen pipelines, attribution plumbing, content infra.',
    body: ['CRM hookups, attribution from ad → close, performance content sites, email automations that don\'t feel like spam.'],
    stack: ['HubSpot', 'Resend', 'Plausible', 'Webflow / custom'],
    timeline: '2 — 6 weeks' },
  { slug: 'corporate-training', name: 'Corporate Training', cluster: 'Grow',
    blurb: 'Hands-on workshops on the stack we build with.',
    body: ['TypeScript fundamentals, ML for engineers, cloud architecture practicums. Run remote or on-site.'],
    stack: ['Live coding', 'Workshop curricula'],
    timeline: '2 — 5 days' }
];
```

- [ ] **Step 4: Refactor `src/objects/services.ts`**

Replace the inline `SERVICES` array. Top of file:

```ts
import { SERVICES, type ServiceCluster, type Service } from '../content/services';
```

Remove the local `const SERVICES`. Update `ServiceNode` interface:

```ts
export interface ServiceNode {
  service: Service;
  position: THREE.Vector3;
  mesh: THREE.Mesh;
  glow: THREE.Mesh;
}
```

In the `forEach`, replace `nodes.push(...)` with:

```ts
nodes.push({ service: svc, position: pos.clone(), mesh, glow });
```

(`svc.cluster` and `svc.name` keep working — `Service` matches the previous shape plus extras.)

- [ ] **Step 5: Update `src/ui/overlays.ts`**

Replace `n.name` with `n.service.name`:

```ts
const tags: HTMLElement[] = nodes.map((n) => {
  const div = document.createElement('div');
  div.className = 'service-tag';
  div.textContent = n.service.name;
  root.appendChild(div);
  return div;
});
```

- [ ] **Step 6: Run tests + build**

```bash
npm run test
npm run build
npm run dev
```

Expected: site identical; constellation renders 14 services correctly.

- [ ] **Step 7: Commit**

```bash
git add src/content src/objects/services.ts src/ui/overlays.ts tests/content-shape.test.ts
git commit -m "refactor: move services to src/content with extended schema"
```

---

## Task 15: BatchedMesh for service nodes

**Files:**
- Modify: `src/objects/services.ts`

- [ ] **Step 1: Replace per-node Mesh with BatchedMesh**

Top of file, ensure import:

```ts
import { BatchedMesh } from 'three';
```

Replace per-service mesh creation with a batched approach. Update the loop and `ServiceNode`:

```ts
export interface ServiceNode {
  service: Service;
  position: THREE.Vector3;
  outerInstId: number;
  innerInstId: number;
  glow: THREE.Mesh;
}
```

In `createServices()`:

```ts
const SHARED_GEO_OUTER = new THREE.IcosahedronGeometry(0.4, 0);
const SHARED_GEO_INNER = new THREE.IcosahedronGeometry(0.32, 0);

const outerMat = new THREE.MeshBasicMaterial({
  color: 0x2ec8ff, wireframe: true, transparent: true, opacity: 0.55
});
const innerMat = new THREE.MeshStandardMaterial({
  color: 0x0a1450, emissive: 0x1f6ee8, emissiveIntensity: 0.4,
  roughness: 0.4, metalness: 0.3
});

const totalInstances = SERVICES.length;
const totalVertsOuter = SERVICES.length * SHARED_GEO_OUTER.attributes.position.count;
const totalIdxOuter = SERVICES.length * (SHARED_GEO_OUTER.index?.count ?? 0);
const totalVertsInner = SERVICES.length * SHARED_GEO_INNER.attributes.position.count;
const totalIdxInner = SERVICES.length * (SHARED_GEO_INNER.index?.count ?? 0);

const batchedOuter = new BatchedMesh(totalInstances, totalVertsOuter, totalIdxOuter, outerMat);
const batchedInner = new BatchedMesh(totalInstances, totalVertsInner, totalIdxInner, innerMat);

const outerGeoId = batchedOuter.addGeometry(SHARED_GEO_OUTER);
const innerGeoId = batchedInner.addGeometry(SHARED_GEO_INNER);

const tmpMatrix = new THREE.Matrix4();
```

Then replace the body of the existing `SERVICES.forEach(...)` (keep the position calculation):

```ts
SERVICES.forEach((svc) => {
  const offset = CLUSTER_OFFSET[svc.cluster];
  const idx = perCluster[svc.cluster]++;
  const ring = Math.floor(idx / 3);
  const angle = (idx % 6) * (Math.PI / 3) + ring * 0.4;
  const r = 2.0 + ring * 0.8;
  const pos = new THREE.Vector3(
    offset.x + Math.cos(angle) * r,
    offset.y + Math.sin(angle) * r * 0.7,
    offset.z + (Math.sin(angle * 1.3) - 0.2) * 1.4
  );

  tmpMatrix.makeTranslation(pos.x, pos.y, pos.z);
  const outerInstId = batchedOuter.addInstance(outerGeoId);
  batchedOuter.setMatrixAt(outerInstId, tmpMatrix);
  const innerInstId = batchedInner.addInstance(innerGeoId);
  batchedInner.setMatrixAt(innerInstId, tmpMatrix);

  const glowGeo = new THREE.SphereGeometry(0.7, 12, 12);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x6fdcff, transparent: true, opacity: 0.08,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.copy(pos);
  group.add(glow);

  nodes.push({ service: svc, position: pos.clone(), outerInstId, innerInstId, glow });
});

group.add(batchedOuter);
group.add(batchedInner);
```

Update `tick`:

```ts
const tick = (t: number) => {
  nodes.forEach((n, i) => {
    tmpMatrix.makeRotationFromEuler(new THREE.Euler(t * 0.3 + i, t * 0.4 + i * 0.2, 0));
    tmpMatrix.setPosition(n.position);
    batchedOuter.setMatrixAt(n.outerInstId, tmpMatrix);
    batchedInner.setMatrixAt(n.innerInstId, tmpMatrix);
    const breathe = 1 + Math.sin(t * 1.2 + i) * 0.06;
    n.glow.scale.setScalar(breathe);
  });
};
```

- [ ] **Step 2: Build + browser QA**

```bash
npm run build
npm run dev
```

Expected: constellation looks the same. DevTools → Performance → confirm fewer draw calls than before.

- [ ] **Step 3: Commit**

```bash
git add src/objects/services.ts
git commit -m "perf(services): switch to BatchedMesh for nodes"
```

---

## Task 16: Click-to-expand service detail panel

**Files:**
- Create: `src/ui/service-detail.ts`
- Modify: `src/ui/overlays.ts`
- Modify: `src/main.ts`
- Modify: `src/styles.css`

- [ ] **Step 1: Create panel module using safe DOM**

`src/ui/service-detail.ts`:

```ts
// Service detail panel: opens when a service tag is clicked. Native <dialog>
// for focus trap + Esc-to-close. Built with safe DOM (no innerHTML).

import type { Service } from '../content/services';
import { el, tree, clear } from '../lib/dom';

export interface ServiceDetailHandle {
  open: (service: Service) => void;
  close: () => void;
}

export function mountServiceDetail(): ServiceDetailHandle {
  const dialog = document.createElement('dialog');
  dialog.className = 'service-detail';

  const closeBtn = el('button', {
    class: 'close',
    text: '×',
    attrs: { 'aria-label': 'Close panel', type: 'button' }
  });

  const content = el('div', { class: 'content' });

  dialog.appendChild(closeBtn);
  dialog.appendChild(content);
  document.body.appendChild(dialog);

  const close = () => dialog.close();
  closeBtn.addEventListener('click', close);
  dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });

  const render = (s: Service) => {
    clear(content);
    content.appendChild(el('span', { class: 'kicker', text: s.cluster }));
    content.appendChild(el('h2', { text: s.name }));
    content.appendChild(el('p', { class: 'lede', text: s.blurb }));
    for (const para of s.body) content.appendChild(el('p', { text: para }));

    const meta = el('div', { class: 'meta' });
    const stackCol = el('div');
    stackCol.appendChild(el('span', { class: 'label', text: 'Stack' }));
    stackCol.appendChild(tree('ul', {}, s.stack.map((x) => el('li', { text: x }))));
    meta.appendChild(stackCol);

    const timelineCol = el('div');
    timelineCol.appendChild(el('span', { class: 'label', text: 'Timeline' }));
    timelineCol.appendChild(el('p', { text: s.timeline }));
    meta.appendChild(timelineCol);

    content.appendChild(meta);
  };

  return {
    open: (service) => { render(service); dialog.showModal(); },
    close
  };
}
```

- [ ] **Step 2: Wire tag clicks**

Modify `src/ui/overlays.ts` `mountServiceTags` signature to accept a callback:

```ts
export function mountServiceTags(
  stage: Stage,
  nodes: ServiceNode[],
  onSelect: (service: ServiceNode['service']) => void
): OverlayHandles {
  const root = document.querySelector<HTMLElement>('.services-grid');
  if (!root) return { tags: [], update: () => {} };

  const tags: HTMLElement[] = nodes.map((n) => {
    const btn = document.createElement('button');
    btn.className = 'service-tag';
    btn.type = 'button';
    btn.textContent = n.service.name;
    btn.addEventListener('click', () => onSelect(n.service));
    root.appendChild(btn);
    return btn;
  });
  // ...rest of function unchanged: keep `tmp`, `update`, return
```

- [ ] **Step 3: Wire panel in `main.ts`**

```ts
import { mountServiceDetail } from './ui/service-detail';
const detail = mountServiceDetail();
const overlays = mountServiceTags(stage, services.nodes, (svc) => detail.open(svc));
```

- [ ] **Step 4: CSS for panel**

Append to `src/styles.css`:

```css
dialog.service-detail {
  position: fixed; top: 0; right: 0; bottom: 0; left: auto;
  margin: 0; height: 100vh; width: min(520px, 92vw); max-width: none;
  background: #07102e; color: var(--ink);
  border: none; border-left: 1px solid rgba(46,200,255,0.18);
  padding: 64px 48px 48px; overflow-y: auto;
}
dialog.service-detail::backdrop {
  background: rgba(5,11,46,0.6); backdrop-filter: blur(6px);
}
dialog.service-detail .close {
  position: absolute; top: 18px; right: 18px;
  background: transparent; border: 1px solid var(--rule);
  color: var(--ink-dim); width: 36px; height: 36px;
  border-radius: 50%; font-size: 18px; cursor: pointer;
}
dialog.service-detail .close:hover { color: var(--cyan); border-color: var(--cyan); }
dialog.service-detail h2 { font-size: 32px; margin: 8px 0 16px; }
dialog.service-detail .lede { font-size: 17px; color: var(--ink); }
dialog.service-detail p { color: var(--ink-dim); line-height: 1.6; }
dialog.service-detail .meta {
  display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
  margin-top: 28px; padding-top: 24px; border-top: 1px solid var(--rule);
}
dialog.service-detail .meta .label {
  font-size: 11px; letter-spacing: 0.2em;
  text-transform: uppercase; color: var(--cyan);
}
dialog.service-detail .meta ul { list-style: none; padding: 8px 0 0; margin: 0; }
dialog.service-detail .meta li { font-size: 13px; color: var(--ink-dim); padding: 2px 0; }
.service-tag { cursor: pointer; pointer-events: auto; background: rgba(5,11,46,0.55); }
@media (max-width: 720px) {
  dialog.service-detail { width: 100vw; padding: 56px 24px 32px; border-left: none; }
}
```

- [ ] **Step 5: QA**

Run: `npm run dev`. Click a service tag.
Expected: side panel slides in. Esc closes. Backdrop click closes.

- [ ] **Step 6: Commit**

```bash
git add src/ui/service-detail.ts src/ui/overlays.ts src/main.ts src/styles.css
git commit -m "feat(services): click-to-expand detail panel"
```

---

## Task 17: Pipeline step detail panels

**Files:**
- Create: `src/content/process.ts`
- Create: `src/ui/step-detail.ts`
- Modify: `src/main.ts`
- Modify: `index.html`
- Modify: `src/styles.css`

- [ ] **Step 1: Create `src/content/process.ts`**

```ts
// Process step content used by the pipeline detail panels.

export interface ProcessStep {
  slug: string;
  name: string;
  blurb: string;
  deliverables: string[];
  duration: string;
}

export const PROCESS: ProcessStep[] = [
  { slug: 'discovery', name: 'Discovery',
    blurb: 'Understand the problem deeply before any code is written.',
    deliverables: ['One-page problem brief', 'Constraints + risks log', 'Recommendation: build / buy / wait'],
    duration: '3 — 5 days' },
  { slug: 'design', name: 'Design',
    blurb: 'Decisions captured before they\'re expensive.',
    deliverables: ['Architecture sketch', 'Data model + API surface', 'Click-through prototype if UI-heavy'],
    duration: '1 — 2 weeks' },
  { slug: 'build', name: 'Build',
    blurb: 'Weekly demos, source you own from day one.',
    deliverables: ['Source repo (yours)', 'CI + tests', 'Weekly demo video + brief'],
    duration: '3 — 6 weeks typical' },
  { slug: 'ship', name: 'Ship',
    blurb: 'Deploy with the runbook the on-call person actually uses.',
    deliverables: ['Production deploy', 'Runbook + monitoring', 'Handover walkthrough'],
    duration: '2 — 5 days' },
  { slug: 'support', name: 'Support',
    blurb: 'Post-launch hardening and follow-on work as it surfaces.',
    deliverables: ['SLA-backed support window', 'Monthly review + roadmap', 'Bug + feature backlog grooming'],
    duration: 'Optional retainer' }
];
```

- [ ] **Step 2: Update `index.html`**

In the `process` scene `.copy` div, after the closing `</p>`, add:

```html
<div class="process-steps"></div>
```

- [ ] **Step 3: Create `src/ui/step-detail.ts`**

```ts
// Pipeline step panel — same dialog pattern as service detail.

import type { ProcessStep } from '../content/process';
import { el, tree, clear } from '../lib/dom';

export interface StepDetailHandle {
  open: (step: ProcessStep) => void;
  close: () => void;
}

export function mountStepDetail(): StepDetailHandle {
  const dialog = document.createElement('dialog');
  dialog.className = 'step-detail service-detail';

  const closeBtn = el('button', {
    class: 'close', text: '×',
    attrs: { 'aria-label': 'Close panel', type: 'button' }
  });
  const content = el('div', { class: 'content' });
  dialog.appendChild(closeBtn);
  dialog.appendChild(content);
  document.body.appendChild(dialog);

  const close = () => dialog.close();
  closeBtn.addEventListener('click', close);
  dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });

  const render = (s: ProcessStep) => {
    clear(content);
    content.appendChild(el('span', { class: 'kicker', text: 'Process' }));
    content.appendChild(el('h2', { text: s.name }));
    content.appendChild(el('p', { class: 'lede', text: s.blurb }));

    const meta = el('div', { class: 'meta' });
    const dCol = el('div');
    dCol.appendChild(el('span', { class: 'label', text: 'Deliverables' }));
    dCol.appendChild(tree('ul', {}, s.deliverables.map((d) => el('li', { text: d }))));
    meta.appendChild(dCol);

    const tCol = el('div');
    tCol.appendChild(el('span', { class: 'label', text: 'Duration' }));
    tCol.appendChild(el('p', { text: s.duration }));
    meta.appendChild(tCol);

    content.appendChild(meta);
  };

  return { open: (step) => { render(step); dialog.showModal(); }, close };
}
```

- [ ] **Step 4: Mount step buttons in `main.ts`**

```ts
import { PROCESS } from './content/process';
import { mountStepDetail } from './ui/step-detail';
import { el } from './lib/dom';

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
```

- [ ] **Step 5: CSS**

Append to `src/styles.css`:

```css
.process-steps {
  display: flex; gap: 10px; flex-wrap: wrap; margin-top: 24px;
  pointer-events: auto;
}
.step-pill {
  background: rgba(5,11,46,0.55);
  border: 1px solid rgba(46,200,255,0.25);
  color: var(--ink);
  font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase;
  padding: 8px 14px; border-radius: 999px; cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.step-pill:hover { background: var(--cyan); color: var(--bg); border-color: var(--cyan); }
```

- [ ] **Step 6: QA**

Run: `npm run dev`. Scroll to process scene. Click each step pill.
Expected: panel opens with deliverables + duration.

- [ ] **Step 7: Commit**

```bash
git add src/content/process.ts src/ui/step-detail.ts src/main.ts index.html src/styles.css
git commit -m "feat(process): pipeline step detail panels"
```

---

## Task 18: Globe continents + animated arc travel

**Files:**
- Create: `public/continents.json` (downloaded asset)
- Modify: `src/objects/globe.ts`
- Modify: `package.json`

- [ ] **Step 1: Download topology**

```bash
curl -L -o "public/continents.json" \
  "https://raw.githubusercontent.com/topojson/world-atlas/master/countries-110m.json"
```

- [ ] **Step 2: Install topojson client**

```bash
npm install topojson-client
npm install -D @types/topojson-client
```

- [ ] **Step 3: Render continents in globe**

In `src/objects/globe.ts`, add imports:

```ts
import * as topojson from 'topojson-client';
import type { MultiLineString } from 'geojson';
```

Inside `createGlobe()`, after the wireframe sphere block, add:

```ts
fetch('./continents.json')
  .then((r) => r.json())
  .then((world) => {
    const land = topojson.mesh(world, world.objects.countries) as MultiLineString;
    const positions: number[] = [];
    for (const ring of land.coordinates) {
      for (let i = 0; i < ring.length - 1; i++) {
        const a = latLngToVec3(ring[i][1], ring[i][0], r * 1.002);
        const b = latLngToVec3(ring[i + 1][1], ring[i + 1][0], r * 1.002);
        positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x6fdcff, transparent: true, opacity: 0.55
    });
    group.add(new THREE.LineSegments(lineGeo, lineMat));
  })
  .catch((e) => console.warn('continents fetch failed', e));
```

- [ ] **Step 4: Animated arc pulses**

Replace the static arc loop. After the dot loop, replace the existing arc loop with:

```ts
const pulses: { mesh: THREE.Mesh; curve: THREE.QuadraticBezierCurve3; offset: number }[] = [];

for (let i = 0; i < dotPositions.length; i++) {
  const a = dotPositions[i];
  const b = dotPositions[(i + 1) % dotPositions.length];
  const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(r * 1.45);
  const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
  const arcGeo = new THREE.TubeGeometry(curve, 40, 0.012, 8, false);
  const arcMat = new THREE.MeshBasicMaterial({
    color: 0x2ec8ff, transparent: true, opacity: 0.35
  });
  group.add(new THREE.Mesh(arcGeo, arcMat));

  const pulseGeo = new THREE.SphereGeometry(0.07, 12, 12);
  const pulseMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const pulse = new THREE.Mesh(pulseGeo, pulseMat);
  group.add(pulse);
  pulses.push({ mesh: pulse, curve, offset: i / dotPositions.length });
}
```

Update `tick`:

```ts
const tick = (t: number) => {
  group.rotation.y = t * 0.08;
  pulses.forEach((p) => {
    const u = ((t * 0.12) + p.offset) % 1;
    p.mesh.position.copy(p.curve.getPointAt(u));
  });
};
```

- [ ] **Step 5: QA**

Run: `npm run dev`. Scroll to globe.
Expected: continents readable as line outlines; pulses travel along arcs.

- [ ] **Step 6: Commit**

```bash
git add src/objects/globe.ts public/continents.json package.json package-lock.json
git commit -m "feat(globe): continent outlines + animated arc pulses"
```

---

# Phase 4 — Content + Pages

## Task 19: Content modules — case studies, testimonials, tiers

**Files:**
- Create: `src/content/case-studies.ts`
- Create: `src/content/testimonials.ts`
- Create: `src/content/tiers.ts`
- Create: `tests/content-shape-2.test.ts`

- [ ] **Step 1: Failing test**

```ts
// tests/content-shape-2.test.ts
import { describe, it, expect } from 'vitest';
import { CASE_STUDIES } from '../src/content/case-studies';
import { TESTIMONIALS } from '../src/content/testimonials';
import { TIERS } from '../src/content/tiers';

describe('content shape', () => {
  it('case studies: 3, all required fields', () => {
    expect(CASE_STUDIES.length).toBe(3);
    for (const c of CASE_STUDIES) {
      expect(c.slug).toMatch(/^[a-z0-9-]+$/);
      expect(c.client).toBeTruthy();
      expect(c.tagline).toBeTruthy();
      expect(c.problem).toBeTruthy();
      expect(c.approach.length).toBeGreaterThan(0);
      expect(c.result.length).toBeGreaterThan(0);
    }
  });
  it('testimonials have a quote and attribution', () => {
    for (const t of TESTIMONIALS) {
      expect(t.quote).toBeTruthy();
      expect(t.author).toBeTruthy();
    }
  });
  it('tiers: 3, each with a CTA', () => {
    expect(TIERS.length).toBe(3);
    for (const tr of TIERS) {
      expect(tr.name).toBeTruthy();
      expect(tr.cta).toBeTruthy();
    }
  });
});
```

- [ ] **Step 2: Run — fail**

Run: `npm run test`

- [ ] **Step 3: Implement modules**

`src/content/case-studies.ts`:

```ts
// Case studies displayed on the index and rendered as standalone pages.
// SwedTeknik content is real; case-two and case-three are placeholders Shubh
// confirms before launch.

export interface CaseStudy {
  slug: string;
  client: string;
  tagline: string;
  cover: string;
  problem: string;
  approach: string[];
  result: { metric: string; value: string }[];
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'swedteknik',
    client: 'SwedTeknik',
    tagline: 'B2C electronics commerce, Sweden — built from scratch on Next.js 15 + Medusa v2.',
    cover: '/cases/swedteknik-cover.png',
    problem: 'A two-founder team needed an e-commerce platform sized for a Swedish-language tech / electronics market — strong product detail, multi-language admin, loyalty + RPA hooks the team could operate without a vendor on retainer. Shopify wasn\'t flexible enough; raw Medusa was too raw.',
    approach: [
      'Next.js 15 storefront with App Router, Medusa v2 backend with 11 custom modules.',
      'Stripe payments, Meilisearch product index, multi-language admin, loyalty program, full admin dashboard.',
      'Shipped MVP in stages — storefront → checkout → admin → loyalty — so the team could start using internal tools early.'
    ],
    result: [
      { metric: 'Custom backend modules', value: '11' },
      { metric: 'Documented features', value: '70+' },
      { metric: 'Vendor lock-in', value: 'zero' }
    ]
  },
  {
    slug: 'case-two',
    client: 'PLACEHOLDER',
    tagline: 'PLACEHOLDER tagline — confirm before launch.',
    cover: '/cases/case-two-cover.png',
    problem: 'PLACEHOLDER — confirm before launch.',
    approach: ['PLACEHOLDER step 1', 'PLACEHOLDER step 2'],
    result: [{ metric: 'PLACEHOLDER', value: '—' }]
  },
  {
    slug: 'case-three',
    client: 'PLACEHOLDER',
    tagline: 'PLACEHOLDER tagline — confirm before launch.',
    cover: '/cases/case-three-cover.png',
    problem: 'PLACEHOLDER — confirm before launch.',
    approach: ['PLACEHOLDER step 1', 'PLACEHOLDER step 2'],
    result: [{ metric: 'PLACEHOLDER', value: '—' }]
  }
];
```

`src/content/testimonials.ts`:

```ts
export interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'PLACEHOLDER — pull a real quote from Shubh\'s SwedTeknik partner or another client before launch.',
    author: 'PLACEHOLDER',
    role: 'PLACEHOLDER'
  }
];
```

`src/content/tiers.ts`:

```ts
export interface Tier {
  name: string;
  pitch: string;
  fit: string[];
  duration: string;
  pricing: string;
  cta: { label: string; href: string };
  featured?: boolean;
}

export const TIERS: Tier[] = [
  {
    name: 'Sprint',
    pitch: 'A focused 1-2 week engagement to de-risk a decision.',
    fit: [
      'Tech audit on an inherited codebase',
      'Working prototype to validate a hypothesis',
      'Single-feature MVP'
    ],
    duration: '1 — 2 weeks',
    pricing: 'From $4,000',
    cta: { label: 'Start a Sprint', href: '#contact' }
  },
  {
    name: 'Build',
    pitch: 'Spec to ship for a real product or internal system.',
    fit: [
      'Custom web app or platform',
      'ML pipeline or integration',
      'E-commerce or CMS-driven site'
    ],
    duration: '4 — 8 weeks typical',
    pricing: 'Project-scoped',
    cta: { label: 'Scope a Build', href: '#contact' },
    featured: true
  },
  {
    name: 'Embed',
    pitch: 'Ongoing support, fractional engineering, ML / RPA operations.',
    fit: [
      'Post-launch hardening + iteration',
      'Fractional eng for a small team',
      'On-call for cloud / infra'
    ],
    duration: 'Monthly retainer',
    pricing: 'From $4,500/mo',
    cta: { label: 'Embed with us', href: '#contact' }
  }
];
```

- [ ] **Step 4: Run — pass**

Run: `npm run test`

- [ ] **Step 5: Commit**

```bash
git add src/content tests/content-shape-2.test.ts
git commit -m "feat(content): case studies, testimonials, tiers"
```

---

## Task 20: Vite multi-page + case study template

**Files:**
- Modify: `vite.config.ts`
- Create: `pages/case-swedteknik.html`
- Create: `pages/case-two.html`
- Create: `pages/case-three.html`
- Create: `404.html`
- Create: `src/case-page.ts`
- Create: `src/styles-case.css`

- [ ] **Step 1: Update `vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import { resolve } from 'path';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  base: './',
  plugins: [glsl()],
  server: { port: 5173, open: false },
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        caseSwedteknik: resolve(__dirname, 'pages/case-swedteknik.html'),
        caseTwo: resolve(__dirname, 'pages/case-two.html'),
        caseThree: resolve(__dirname, 'pages/case-three.html'),
        notFound: resolve(__dirname, '404.html')
      }
    }
  }
});
```

- [ ] **Step 2: Create case page template**

`pages/case-swedteknik.html`:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" type="image/png" href="/fss-logo.png" />
  <title>SwedTeknik — Fermion Software Solutions</title>
  <meta name="description" content="Custom B2C e-commerce platform on Next.js 15 + Medusa v2 for the Swedish electronics market." />
</head>
<body>
  <header class="case-nav">
    <a class="brand" href="/">← Fermion</a>
  </header>
  <main class="case" data-slug="swedteknik">
    <article class="case-body"></article>
  </main>
  <script type="module" src="/src/case-page.ts"></script>
</body>
</html>
```

Duplicate the file to `pages/case-two.html` and `pages/case-three.html`. In each, change:
- `data-slug="case-two"` (or `case-three`)
- `<title>` and `<meta name="description">` to placeholders Shubh edits later.

- [ ] **Step 3: Create `src/case-page.ts`**

```ts
// Shared bootstrap for case-study pages. Reads data-slug from <main>, looks up
// content, renders into <article>. No 3D, no GSAP — fast LCP.

import './styles-case.css';
import { CASE_STUDIES } from './content/case-studies';
import { el, tree, clear } from './lib/dom';

const main = document.querySelector<HTMLElement>('main.case');
if (!main) throw new Error('Missing <main class="case">');

const slug = main.dataset.slug ?? '';
const study = CASE_STUDIES.find((c) => c.slug === slug);
const article = main.querySelector<HTMLElement>('article')!;

if (!study) {
  article.appendChild(el('p', { text: 'Case study not found.' }));
} else {
  clear(article);
  article.appendChild(el('p', { class: 'kicker', text: 'Case study' }));
  article.appendChild(el('h1', { text: study.client }));
  article.appendChild(el('p', { class: 'lede', text: study.tagline }));

  const problemSection = el('section');
  problemSection.appendChild(el('h2', { text: 'Problem' }));
  problemSection.appendChild(el('p', { text: study.problem }));
  article.appendChild(problemSection);

  const approachSection = el('section');
  approachSection.appendChild(el('h2', { text: 'Approach' }));
  approachSection.appendChild(tree('ul', {}, study.approach.map((s) => el('li', { text: s }))));
  article.appendChild(approachSection);

  const resultSection = el('section');
  resultSection.appendChild(el('h2', { text: 'Result' }));
  const stats = el('div', { class: 'stats' });
  for (const r of study.result) {
    const stat = el('div', { class: 'stat' });
    stat.appendChild(el('span', { class: 'value', text: r.value }));
    stat.appendChild(el('span', { class: 'metric', text: r.metric }));
    stats.appendChild(stat);
  }
  resultSection.appendChild(stats);
  article.appendChild(resultSection);

  const back = el('a', {
    class: 'back', text: '← Back to Fermion',
    attrs: { href: '/' }
  });
  article.appendChild(back);
}
```

- [ ] **Step 4: Case page CSS**

`src/styles-case.css`:

```css
/* Case study editorial layout — dark theme, no 3D, fast LCP. */

:root {
  --bg: #050b2e; --ink: #f4f7ff; --ink-dim: #aab4d4;
  --cyan: #2ec8ff; --rule: rgba(255,255,255,0.08);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}
* { box-sizing: border-box; }
html, body { margin: 0; background: var(--bg); color: var(--ink); }

.case-nav { padding: 22px clamp(20px, 4vw, 56px); }
.case-nav .brand {
  color: var(--ink); text-decoration: none;
  font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; font-size: 13px;
}
.case-nav .brand:hover { color: var(--cyan); }

main.case {
  padding: 32px clamp(20px, 4vw, 56px) 96px;
  max-width: 880px; margin: 0 auto;
}

.kicker { font-size: 11px; letter-spacing: 0.22em; color: var(--cyan); text-transform: uppercase; }
h1 { font-size: clamp(36px, 6vw, 64px); line-height: 1.05; margin: 8px 0 18px; }
.lede { font-size: clamp(17px, 1.4vw, 21px); color: var(--ink); max-width: 56ch; line-height: 1.5; }
section { margin-top: 56px; padding-top: 28px; border-top: 1px solid var(--rule); }
section h2 { font-size: 24px; margin: 0 0 16px; color: var(--cyan); letter-spacing: -0.01em; }
section p, section li { color: var(--ink-dim); line-height: 1.65; font-size: 16px; }
section ul { padding-left: 20px; }

.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 24px; }
.stat {
  padding: 18px 22px; background: rgba(46,200,255,0.06);
  border: 1px solid rgba(46,200,255,0.15); border-radius: 6px;
}
.stat .value { display: block; font-size: 32px; font-weight: 700; color: var(--ink); }
.stat .metric {
  font-size: 11px; letter-spacing: 0.16em;
  text-transform: uppercase; color: var(--ink-dim);
}

.back { display: inline-block; margin-top: 64px; color: var(--cyan); text-decoration: none; letter-spacing: 0.04em; }
.back:hover { text-decoration: underline; }
```

- [ ] **Step 5: Build + preview**

```bash
npm run build
npm run preview
```

Open `http://localhost:4173/pages/case-swedteknik.html`.
Expected: editorial layout renders with SwedTeknik content.

- [ ] **Step 6: Commit**

```bash
git add vite.config.ts pages 404.html src/case-page.ts src/styles-case.css
git commit -m "feat: Vite multi-page setup + case study template"
```

---

## Task 21: 404 page

**Files:**
- Modify: `404.html`
- Create: `src/not-found.ts`
- Modify: `src/styles-case.css`

- [ ] **Step 1: Replace `404.html`**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" type="image/png" href="/fss-logo.png" />
  <title>Lost in space — Fermion Software Solutions</title>
</head>
<body>
  <canvas id="bg-404"></canvas>
  <main class="not-found">
    <span class="kicker">404 — Off course</span>
    <h1>Lost in space.</h1>
    <p>This page is somewhere between the atom and the globe. Let's get you back.</p>
    <a href="/" class="back">← Return home</a>
  </main>
  <script type="module" src="/src/not-found.ts"></script>
</body>
</html>
```

- [ ] **Step 2: Create `src/not-found.ts`**

```ts
// 404 page: tiny canvas with a single drifting particle. No bloom, no scene state.

import './styles-case.css';

const canvas = document.getElementById('bg-404') as HTMLCanvasElement | null;
if (canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas unsupported');
  const fit = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
  fit();
  addEventListener('resize', fit);

  let t = 0;
  const draw = () => {
    t += 0.01;
    ctx.fillStyle = '#050b2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const x = canvas.width / 2 + Math.cos(t * 0.6) * 80;
    const y = canvas.height / 2 + Math.sin(t * 0.4) * 40;
    const grd = ctx.createRadialGradient(x, y, 0, x, y, 60);
    grd.addColorStop(0, 'rgba(111,220,255,0.9)');
    grd.addColorStop(1, 'rgba(46,200,255,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(x - 60, y - 60, 120, 120);
    requestAnimationFrame(draw);
  };
  draw();
}
```

- [ ] **Step 3: 404 CSS**

Append to `src/styles-case.css`:

```css
#bg-404 { position: fixed; inset: 0; z-index: 0; display: block; }
main.not-found {
  position: relative; z-index: 1;
  min-height: 100vh;
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  padding: 0 24px;
}
main.not-found h1 { margin: 12px 0 16px; }
main.not-found p { color: var(--ink-dim); max-width: 48ch; text-align: center; }
```

- [ ] **Step 4: Build + preview**

```bash
npm run build
npm run preview
```

Open `http://localhost:4173/404.html`.
Expected: drifting particle, copy, return-home link.

- [ ] **Step 5: Commit**

```bash
git add 404.html src/not-found.ts src/styles-case.css
git commit -m "feat: 404 page with drifting particle"
```

---

## Task 22: Case-study cards section on index

**Files:**
- Create: `src/ui/case-cards.ts`
- Modify: `index.html`
- Modify: `src/main.ts`
- Modify: `src/styles.css`

- [ ] **Step 1: Insert new scene in `index.html`**

Between `globe` and `contact` scenes:

```html
<section class="scene" data-scene="cases" id="cases">
  <div class="copy left">
    <span class="kicker">06 — Selected work</span>
    <h2>Three projects, fewer surprises.</h2>
    <p>What we've built recently. Click any card for the full story.</p>
  </div>
  <div class="case-grid"></div>
</section>
```

(Renumber existing kickers if needed: contact moves to `08`, etc. Keep the data-scene names.)

- [ ] **Step 2: Create `src/ui/case-cards.ts`**

```ts
// Case study card grid for the index. Links to standalone case pages.

import { CASE_STUDIES } from '../content/case-studies';
import { el, tree } from '../lib/dom';
import { track } from '../lib/analytics';

export function mountCaseCards(root: HTMLElement): void {
  for (const c of CASE_STUDIES) {
    const a = el('a', {
      class: 'case-card',
      attrs: { href: `./pages/case-${c.slug}.html` },
      on: { click: () => track('case_study_open', { slug: c.slug }) }
    });
    a.appendChild(el('span', { class: 'kicker', text: c.client }));
    a.appendChild(el('h3', { text: c.tagline }));

    const results = el('div', { class: 'results' });
    for (const r of c.result.slice(0, 2)) {
      const span = el('span', {});
      span.appendChild(el('strong', { text: r.value }));
      span.appendChild(document.createTextNode(' ' + r.metric));
      results.appendChild(span);
    }
    a.appendChild(results);
    a.appendChild(el('span', { class: 'more', text: 'Read the case →' }));
    root.appendChild(a);
  }
}
```

(`track` will exist once Task 28 lands. For now, stub it: open `src/lib/analytics.ts` and add a no-op export, OR temporarily use `() => {}` and remove that import. Cleaner: build Task 28 first if you're working strictly sequentially. The plan order assumes you do — see ordering note below.)

**Ordering note:** Move analytics work (Task 28) earlier if you reach Task 22 first — it's a 5-min delta. Or keep this comment as a reminder and skip the `track` import for now.

- [ ] **Step 3: Mount in `main.ts`**

```ts
import { mountCaseCards } from './ui/case-cards';
const caseRoot = document.querySelector<HTMLElement>('.case-grid');
if (caseRoot) mountCaseCards(caseRoot);
```

- [ ] **Step 4: CSS**

Append to `src/styles.css`:

```css
.scene[data-scene="cases"] {
  flex-direction: column; align-items: stretch;
  padding-top: 80px; padding-bottom: 80px;
}
.scene[data-scene="cases"] .copy { margin-bottom: 40px; }
.case-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 18px; pointer-events: auto;
}
.case-card {
  display: block; padding: 22px 24px 24px;
  background: rgba(5,11,46,0.75);
  border: 1px solid rgba(46,200,255,0.18);
  border-radius: 8px;
  color: var(--ink); text-decoration: none;
  transition: border-color 0.2s, transform 0.15s;
}
.case-card:hover { border-color: var(--cyan); transform: translateY(-2px); }
.case-card .kicker { display: block; margin-bottom: 8px; }
.case-card h3 { font-size: 18px; line-height: 1.3; margin: 0 0 14px; font-weight: 600; }
.case-card .results { display: flex; gap: 18px; flex-wrap: wrap; margin-bottom: 16px; }
.case-card .results span { font-size: 12px; color: var(--ink-dim); }
.case-card .results strong { color: var(--cyan); font-weight: 700; margin-right: 4px; }
.case-card .more {
  font-size: 11px; letter-spacing: 0.18em;
  color: var(--cyan); text-transform: uppercase;
}
```

- [ ] **Step 5: QA**

Run: `npm run dev`. Scroll past globe to see cards. Click one.
Expected: navigates to corresponding case page.

- [ ] **Step 6: Commit**

```bash
git add src/ui/case-cards.ts index.html src/main.ts src/styles.css
git commit -m "feat: case study cards section on index"
```

---

## Task 23: Trust stat row

**Files:**
- Create: `src/ui/trust-row.ts`
- Modify: `index.html`
- Modify: `src/main.ts`
- Modify: `src/styles.css`

- [ ] **Step 1: Hook in `index.html`**

In the `cases` scene `.copy` block, after `<p>...</p>`, add:

```html
<div class="trust-row"></div>
```

- [ ] **Step 2: Create `src/ui/trust-row.ts`**

```ts
// Trust stat row + one testimonial pull. No client logos in v1 per spec decision.

import { TESTIMONIALS } from '../content/testimonials';
import { el } from '../lib/dom';

interface Stat { value: string; label: string; }
const STATS: Stat[] = [
  { value: '30+', label: 'Deliveries' },
  { value: '4',   label: 'Countries' },
  { value: '0',   label: 'Vendor lock-in' },
  { value: '~95%', label: 'Repeat / referral' }
];

export function mountTrustRow(root: HTMLElement): void {
  const stats = el('div', { class: 'trust-stats' });
  for (const s of STATS) {
    const cell = el('div', {});
    cell.appendChild(el('strong', { text: s.value }));
    cell.appendChild(el('span', { text: s.label }));
    stats.appendChild(cell);
  }
  root.appendChild(stats);

  const t = TESTIMONIALS[0];
  if (t) {
    const block = el('blockquote', { class: 'trust-quote' });
    block.appendChild(el('p', { text: '"' + t.quote + '"' }));
    block.appendChild(el('cite', { text: '— ' + t.author + ', ' + t.role }));
    root.appendChild(block);
  }
}
```

- [ ] **Step 3: Mount in `main.ts`**

```ts
import { mountTrustRow } from './ui/trust-row';
const trustRoot = document.querySelector<HTMLElement>('.trust-row');
if (trustRoot) mountTrustRow(trustRoot);
```

- [ ] **Step 4: CSS**

Append to `src/styles.css`:

```css
.trust-row { margin-top: 24px; }
.trust-stats {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px; margin-bottom: 24px;
}
.trust-stats > div { padding: 12px 16px; border-left: 2px solid var(--cyan); }
.trust-stats strong { display: block; font-size: 22px; font-weight: 700; color: var(--ink); }
.trust-stats span {
  font-size: 11px; letter-spacing: 0.16em;
  color: var(--ink-dim); text-transform: uppercase;
}
.trust-quote {
  margin: 0; padding: 18px 22px;
  background: rgba(46,200,255,0.05); border-left: 2px solid var(--cyan);
}
.trust-quote p { font-size: 16px; line-height: 1.5; color: var(--ink); margin: 0 0 10px; }
.trust-quote cite { font-style: normal; font-size: 12px; color: var(--ink-dim); letter-spacing: 0.06em; }
```

- [ ] **Step 5: QA + commit**

```bash
git add src/ui/trust-row.ts index.html src/main.ts src/styles.css
git commit -m "feat: trust stat row + testimonial"
```

---

# Phase 5 — Conversion

## Task 24: Engagement tiers section

**Files:**
- Create: `src/ui/tiers.ts`
- Modify: `index.html`
- Modify: `src/main.ts`
- Modify: `src/styles.css`

- [ ] **Step 1: Add scene to `index.html`**

After `cases`, before `contact`:

```html
<section class="scene" data-scene="tiers" id="tiers">
  <div class="copy center">
    <span class="kicker">07 — Engagements</span>
    <h2>Three ways to work with us.</h2>
    <p>Pick the shape that fits the question. Always tailored to scope on the call.</p>
  </div>
  <div class="tiers-grid"></div>
</section>
```

- [ ] **Step 2: Create `src/ui/tiers.ts`**

```ts
// Engagement tiers grid.

import { TIERS } from '../content/tiers';
import { el, tree } from '../lib/dom';

export function mountTiers(root: HTMLElement): void {
  for (const t of TIERS) {
    const card = el('div', { class: 'tier-card' + (t.featured ? ' featured' : '') });
    card.appendChild(el('h3', { text: t.name }));
    card.appendChild(el('p', { class: 'pitch', text: t.pitch }));
    card.appendChild(el('p', { class: 'duration', text: t.duration }));
    card.appendChild(el('p', { class: 'pricing', text: t.pricing }));
    card.appendChild(tree('ul', {}, t.fit.map((x) => el('li', { text: x }))));
    card.appendChild(el('a', { class: 'cta', text: t.cta.label, attrs: { href: t.cta.href } }));
    root.appendChild(card);
  }
}
```

- [ ] **Step 3: Mount in `main.ts`**

```ts
import { mountTiers } from './ui/tiers';
const tiersRoot = document.querySelector<HTMLElement>('.tiers-grid');
if (tiersRoot) mountTiers(tiersRoot);
```

- [ ] **Step 4: CSS**

Append to `src/styles.css`:

```css
.scene[data-scene="tiers"] {
  flex-direction: column;
  padding-top: 80px; padding-bottom: 80px;
}
.scene[data-scene="tiers"] .copy { margin-bottom: 40px; }
.tiers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px; pointer-events: auto;
}
.tier-card {
  padding: 28px 26px;
  background: rgba(5,11,46,0.75);
  border: 1px solid rgba(46,200,255,0.18);
  border-radius: 8px;
}
.tier-card.featured {
  border-color: var(--cyan);
  box-shadow: 0 0 0 1px rgba(46,200,255,0.4) inset;
}
.tier-card h3 { margin: 0 0 8px; font-size: 22px; }
.tier-card .pitch { color: var(--ink); font-size: 14px; margin: 0 0 18px; }
.tier-card .duration, .tier-card .pricing {
  font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--cyan); margin: 0 0 4px;
}
.tier-card ul { padding-left: 18px; margin: 14px 0 22px; }
.tier-card li { font-size: 13px; line-height: 1.6; color: var(--ink-dim); }
.tier-card .cta {
  display: inline-block; padding: 10px 20px;
  border: 1px solid var(--cyan); color: var(--cyan);
  text-decoration: none; border-radius: 999px; font-size: 13px;
}
.tier-card .cta:hover { background: var(--cyan); color: var(--bg); }
```

- [ ] **Step 5: QA + commit**

```bash
git add src/ui/tiers.ts index.html src/main.ts src/styles.css
git commit -m "feat: engagement tiers section"
```

---

## Task 25: Contact form (UI + client validation, TDD)

**Files:**
- Create: `src/ui/form.ts`
- Create: `tests/form.test.ts`
- Modify: `index.html`
- Modify: `src/main.ts`
- Modify: `src/styles.css`

- [ ] **Step 1: Failing test**

```ts
// tests/form.test.ts
import { describe, it, expect } from 'vitest';
import { validateFields } from '../src/ui/form';

describe('validateFields', () => {
  it('rejects empty name', () => {
    const r = validateFields({ name: '', email: 'a@b.co', project: 'build me a thing' });
    expect(r.valid).toBe(false);
    expect(r.errors.name).toBeTruthy();
  });
  it('rejects bad email', () => {
    const r = validateFields({ name: 'A', email: 'not-an-email', project: 'build me a thing' });
    expect(r.valid).toBe(false);
    expect(r.errors.email).toBeTruthy();
  });
  it('rejects too-short project', () => {
    const r = validateFields({ name: 'A', email: 'a@b.co', project: 'hi' });
    expect(r.valid).toBe(false);
    expect(r.errors.project).toBeTruthy();
  });
  it('accepts a fully filled form', () => {
    const r = validateFields({ name: 'A', email: 'a@b.co', project: 'Build me a thing.' });
    expect(r.valid).toBe(true);
    expect(Object.keys(r.errors).length).toBe(0);
  });
});
```

- [ ] **Step 2: Run — fail**

Run: `npm run test`

- [ ] **Step 3: Implement `src/ui/form.ts`**

```ts
// Contact form: client-side validation, POST to /api/contact, inline status.

import { el, clear } from '../lib/dom';
import { track } from '../lib/analytics';

export interface FormFields {
  name: string;
  email: string;
  project: string;
  budget?: string;
}

export interface Validation {
  valid: boolean;
  errors: Partial<Record<keyof FormFields, string>>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateFields(f: FormFields): Validation {
  const errors: Validation['errors'] = {};
  if (!f.name.trim()) errors.name = 'Tell us your name.';
  if (!EMAIL_RE.test(f.email)) errors.email = 'That email looks off.';
  if (f.project.trim().length < 5) errors.project = 'A few words about the project would help.';
  return { valid: Object.keys(errors).length === 0, errors };
}

interface FormOpts { endpoint: string; }

export function mountForm(root: HTMLElement, opts: FormOpts): void {
  clear(root);

  const form = el('form', {
    class: 'contact-form',
    attrs: { novalidate: 'novalidate' }
  });

  const labelName = el('label', { text: 'Name' });
  const inputName = el('input', { attrs: { name: 'name', required: 'required', autocomplete: 'name' } });
  labelName.appendChild(inputName);

  const labelEmail = el('label', { text: 'Email' });
  const inputEmail = el('input', { attrs: { name: 'email', type: 'email', required: 'required', autocomplete: 'email' } });
  labelEmail.appendChild(inputEmail);

  const labelProject = el('label', { text: 'What are you trying to ship?' });
  const inputProject = el('textarea', { attrs: { name: 'project', rows: '4', required: 'required' } });
  labelProject.appendChild(inputProject);

  const labelBudget = el('label', { text: 'Budget (optional)' });
  const inputBudget = el('input', { attrs: { name: 'budget', placeholder: '$10k / scope-dependent / not yet' } });
  labelBudget.appendChild(inputBudget);

  const submit = el('button', { text: 'Send', attrs: { type: 'submit' } });
  const status = el('p', { class: 'form-status', attrs: { role: 'status', 'aria-live': 'polite' } });

  form.appendChild(labelName);
  form.appendChild(labelEmail);
  form.appendChild(labelProject);
  form.appendChild(labelBudget);
  form.appendChild(submit);
  form.appendChild(status);
  root.appendChild(form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data: FormFields = {
      name: inputName.value,
      email: inputEmail.value,
      project: (inputProject as HTMLTextAreaElement).value,
      budget: inputBudget.value || undefined
    };
    const { valid, errors } = validateFields(data);
    form.querySelectorAll('label').forEach((l) => l.classList.remove('error'));
    if (!valid) {
      Object.keys(errors).forEach((key) => {
        const input = form.querySelector<HTMLElement>(`[name="${key}"]`);
        input?.parentElement?.classList.add('error');
      });
      status.textContent = 'Fix the highlighted fields.';
      status.className = 'form-status err';
      return;
    }
    status.textContent = 'Sending…';
    status.className = 'form-status';
    try {
      const res = await fetch(opts.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`Server ${res.status}`);
      status.textContent = 'Sent. We\'ll respond within a working day.';
      status.className = 'form-status ok';
      track('form_submit', { result: 'success' });
      form.reset();
    } catch {
      status.textContent = 'Couldn\'t send — try again or email support@fermionsoftwaresolutions.com directly.';
      status.className = 'form-status err';
      track('form_submit', { result: 'error' });
    }
  });
}
```

(Note: `track` from analytics — Task 28 adds it. If running tasks strictly in order, temporarily replace `track(...)` calls with `// track('form_submit', ...)` comments and uncomment after Task 28.)

- [ ] **Step 4: Run — pass**

Run: `npm run test`

- [ ] **Step 5: Mount form in `index.html`**

In the `contact` scene, replace the existing CTA `<a class="cta" href="mailto:...">...</a>` with:

```html
<div class="contact-form-mount"></div>
<div class="contact-or">or email us directly:</div>
<a class="cta" href="mailto:support@fermionsoftwaresolutions.com">support@fermionsoftwaresolutions.com</a>
```

- [ ] **Step 6: Wire in `main.ts`**

```ts
import { mountForm } from './ui/form';
const formRoot = document.querySelector<HTMLElement>('.contact-form-mount');
if (formRoot) mountForm(formRoot, { endpoint: '/api/contact' });
```

- [ ] **Step 7: CSS**

Append to `src/styles.css`:

```css
.contact-form {
  display: grid; gap: 14px;
  max-width: 520px; margin: 24px auto 16px;
  pointer-events: auto;
}
.contact-form label {
  display: grid; gap: 6px;
  font-size: 11px; letter-spacing: 0.16em;
  text-transform: uppercase; color: var(--ink-dim); text-align: left;
}
.contact-form input, .contact-form textarea {
  background: rgba(5,11,46,0.75);
  border: 1px solid var(--rule);
  color: var(--ink);
  padding: 10px 14px;
  font: inherit; font-size: 15px;
  letter-spacing: normal; text-transform: none;
  border-radius: 6px;
  transition: border-color 0.2s;
}
.contact-form input:focus, .contact-form textarea:focus { border-color: var(--cyan); outline: none; }
.contact-form label.error input, .contact-form label.error textarea { border-color: #ff7b7b; }
.contact-form button {
  padding: 12px 24px;
  background: var(--cyan); color: var(--bg);
  border: none; border-radius: 999px;
  font-weight: 700; letter-spacing: 0.06em; cursor: pointer;
  justify-self: start;
}
.contact-form button:hover { transform: translateY(-1px); }
.form-status { font-size: 13px; min-height: 18px; }
.form-status.err { color: #ff9b9b; }
.form-status.ok { color: var(--cyan); }
.contact-or {
  font-size: 12px; letter-spacing: 0.16em;
  text-transform: uppercase; color: var(--ink-dim); margin-top: 8px;
}
```

- [ ] **Step 8: Browser QA (no backend yet)**

Run: `npm run dev`. Submit with bad data → inline error. With good data → "Sending…" → fails → error message.

- [ ] **Step 9: Commit**

```bash
git add src/ui/form.ts tests/form.test.ts index.html src/main.ts src/styles.css
git commit -m "feat: contact form UI + client validation"
```

---

## Task 26: Cloudflare Pages Function `/api/contact`

**Manual prerequisites (Shubh):** Resend account, verify `fermionsoftwaresolutions.com` domain (DNS records), generate API key. Set `RESEND_API_KEY` and `CONTACT_TO_EMAIL` as Cloudflare Pages environment variables.

**Files:**
- Create: `functions/api/contact.ts`
- Create: `tests/contact-function.test.ts`
- Modify: `package.json`, `tsconfig.json`, `.gitignore`

- [ ] **Step 1: Install wrangler + types**

```bash
npm install -D wrangler @cloudflare/workers-types
```

In `tsconfig.json` `compilerOptions.types`, add `"@cloudflare/workers-types"`.

- [ ] **Step 2: Failing test**

```ts
// tests/contact-function.test.ts
import { describe, it, expect } from 'vitest';
import { validatePayload } from '../functions/api/contact';

describe('contact function validation', () => {
  it('rejects missing fields', () => {
    expect(validatePayload({ name: '', email: '', project: '' }).ok).toBe(false);
  });
  it('rejects bad email', () => {
    expect(validatePayload({ name: 'A', email: 'nope', project: 'hi there' }).ok).toBe(false);
  });
  it('accepts a good payload', () => {
    expect(validatePayload({ name: 'A', email: 'a@b.co', project: 'build me a thing' }).ok).toBe(true);
  });
});
```

- [ ] **Step 3: Implement `functions/api/contact.ts`**

```ts
// Cloudflare Pages Function for the contact form.
// Validates payload, sends notification + auto-reply via Resend.

interface Env {
  RESEND_API_KEY: string;
  CONTACT_TO_EMAIL: string;
}

interface Payload { name: string; email: string; project: string; budget?: string; }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validatePayload(p: Partial<Payload>): { ok: boolean; reason?: string } {
  if (!p.name || !p.name.trim()) return { ok: false, reason: 'name' };
  if (!p.email || !EMAIL_RE.test(p.email)) return { ok: false, reason: 'email' };
  if (!p.project || p.project.trim().length < 5) return { ok: false, reason: 'project' };
  return { ok: true };
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: Partial<Payload>;
  try { body = await request.json(); }
  catch { return new Response('Bad JSON', { status: 400 }); }

  const v = validatePayload(body);
  if (!v.ok) {
    return new Response(JSON.stringify({ error: 'invalid', field: v.reason }), { status: 400 });
  }

  const p = body as Payload;

  const sendEmail = (to: string, subject: string, html: string) =>
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Fermion <noreply@fermionsoftwaresolutions.com>',
        to, subject, html
      })
    });

  const notif = sendEmail(env.CONTACT_TO_EMAIL,
    `New lead: ${p.name}`,
    `<p><strong>${p.name}</strong> (${p.email})</p>
     <p><strong>Project:</strong></p><p>${escapeHtml(p.project)}</p>
     ${p.budget ? `<p><strong>Budget:</strong> ${escapeHtml(p.budget)}</p>` : ''}`
  );

  const reply = sendEmail(p.email,
    'We got your message — Fermion Software Solutions',
    `<p>Hey ${escapeHtml(p.name)},</p>
     <p>Thanks for reaching out. We'll review what you sent and respond within a working day.</p>
     <p>— Fermion Software Solutions</p>`
  );

  const results = await Promise.all([notif, reply]);
  if (results.some((r) => !r.ok)) {
    return new Response(JSON.stringify({ error: 'send-failed' }), { status: 502 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

function escapeHtml(s: string): string {
  const map: Record<string, string> = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  };
  return s.replace(/[&<>"']/g, (c) => map[c]);
}
```

- [ ] **Step 4: Run tests — pass**

Run: `npm run test`

- [ ] **Step 5: Local Functions test**

Add `.dev.vars` to `.gitignore`:
```
.dev.vars
```

Then create `.dev.vars` with test values:
```
RESEND_API_KEY=re_test_local
CONTACT_TO_EMAIL=shubhjani1999@gmail.com
```

Run wrangler:
```bash
npx wrangler pages dev -- npm run dev
```

In another terminal:
```bash
curl -X POST http://localhost:8788/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"name":"A","email":"a@b.co","project":"build me a thing"}'
```

Expected: 502 (Resend rejects the test key), but the function logic ran without crashing.

- [ ] **Step 6: Commit**

```bash
git add functions tests/contact-function.test.ts package.json package-lock.json tsconfig.json .gitignore
git commit -m "feat: Cloudflare Pages Function for contact form (Resend)"
```

---

## Task 27: Cal.com booking embed

**Manual prerequisite:** Shubh creates a Cal.com account, picks a 30-min event slug like `fermion/intro`. Replace the placeholder slug in Step 1 below.

**Files:**
- Create: `src/ui/booking.ts`
- Modify: `index.html`
- Modify: `src/main.ts`
- Modify: `src/styles.css`

- [ ] **Step 1: Add booking section to index**

In the `contact` scene, before the `.contact-form-mount`:

```html
<div class="booking-row">
  <span class="kicker">Or skip the form</span>
  <button type="button" class="cta cta-book" data-cal-link="fermion/intro">Book a 30-min call</button>
</div>
```

- [ ] **Step 2: Create `src/ui/booking.ts`**

```ts
// Cal.com inline embed loader. Loads only on first click — keeps initial bundle clean.

import { track } from '../lib/analytics';

let calLoaded = false;

export function attachCalLinks(): void {
  document.querySelectorAll<HTMLElement>('[data-cal-link]').forEach((el) => {
    el.addEventListener('click', () => {
      track('cta_book_click');
      if (!calLoaded) { loadCal(); calLoaded = true; }
      const link = el.dataset.calLink ?? '';
      const w = window as unknown as { Cal?: (...args: unknown[]) => void };
      w.Cal?.('ui', { theme: 'dark' });
      w.Cal?.('modal', { calLink: link });
    });
  });
}

function loadCal(): void {
  const s = document.createElement('script');
  s.textContent = `(function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init"); Cal("init", { origin: "https://cal.com" });`;
  document.head.appendChild(s);
}
```

- [ ] **Step 3: Wire in `main.ts`**

```ts
import { attachCalLinks } from './ui/booking';
attachCalLinks();
```

- [ ] **Step 4: CSS**

Append to `src/styles.css`:

```css
.booking-row {
  display: flex; flex-direction: column;
  align-items: center; gap: 10px; margin-bottom: 16px;
}
.cta-book {
  background: transparent;
  border: 1px solid var(--cyan);
  color: var(--cyan); cursor: pointer;
}
.cta-book:hover { background: var(--cyan); color: var(--bg); }
```

- [ ] **Step 5: QA + commit**

```bash
git add src/ui/booking.ts index.html src/main.ts src/styles.css
git commit -m "feat: Cal.com booking embed (lazy-loaded on click)"
```

---

## Task 28: Plausible analytics

**Files:**
- Create: `src/lib/analytics.ts`
- Modify: `src/main.ts`
- Create: `.env.example`
- Modify: `.gitignore`

- [ ] **Step 1: Create `src/lib/analytics.ts`**

```ts
// Plausible analytics. No-ops if VITE_PLAUSIBLE_DOMAIN is unset.

const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined;

export function initAnalytics(): void {
  if (!domain) return;
  const s = document.createElement('script');
  s.defer = true;
  s.src = 'https://plausible.io/js/script.js';
  s.setAttribute('data-domain', domain);
  document.head.appendChild(s);

  const inline = document.createElement('script');
  inline.textContent = 'window.plausible = window.plausible || function(){(window.plausible.q=window.plausible.q||[]).push(arguments)}';
  document.head.appendChild(inline);
}

export function track(event: string, props?: Record<string, string | number>): void {
  if (!domain) return;
  const w = window as unknown as { plausible?: (e: string, opts?: { props?: Record<string, string | number> }) => void };
  w.plausible?.(event, { props });
}
```

- [ ] **Step 2: `.env.example`**

```
VITE_PLAUSIBLE_DOMAIN=fermionsoftwaresolutions.com
```

Add to `.gitignore`:
```
.env
.env.local
```

- [ ] **Step 3: Wire `initAnalytics` and `track` calls**

In `src/main.ts`:
```ts
import { initAnalytics } from './lib/analytics';
initAnalytics();
```

In `src/ui/service-detail.ts` `open()` function, before `dialog.showModal()`:
```ts
import { track } from '../lib/analytics';
// inside open():
track('service_detail_open', { slug: service.slug });
```

(Imports already in `src/ui/case-cards.ts`, `src/ui/form.ts`, `src/ui/booking.ts` from prior tasks — uncomment any temporarily-stubbed `track(...)` calls now.)

- [ ] **Step 4: Commit**

```bash
git add src/lib/analytics.ts src/main.ts src/ui .env.example .gitignore
git commit -m "feat: Plausible analytics + key event tracking"
```

---

## Task 29: Phase 5 visual + integration QA

**No code change task — discipline gate.**

- [ ] **Step 1:** Walk every section: hero → intro → services (open a panel) → process (open a step) → globe → cases (open a card) → tiers → contact (book a call modal opens, submit form returns error).
- [ ] **Step 2:** Resize to 375px (iPhone SE) — confirm everything reflows.
- [ ] **Step 3:** Toggle reduce-motion → reload → all scenes visible at once, no scrub. Forms / panels still work.
- [ ] **Step 4:** Commit any tuning.

```bash
git add -p
git commit -m "tune: Phase 5 polish"
```

---

# Phase 6 — Launch

## Task 30: SEO helpers + meta tags + JSON-LD

**Files:**
- Create: `src/lib/seo.ts`
- Create: `tests/seo.test.ts`
- Modify: `index.html`
- Modify: `pages/case-*.html`
- Modify: `src/main.ts`

- [ ] **Step 1: Failing test**

```ts
// tests/seo.test.ts
import { describe, it, expect } from 'vitest';
import { organizationJsonLd, serviceJsonLd } from '../src/lib/seo';

describe('seo helpers', () => {
  it('Organization JSON-LD has required fields', () => {
    const json = organizationJsonLd();
    expect(json['@type']).toBe('Organization');
    expect(json.name).toBe('Fermion Software Solutions');
    expect(json.url).toMatch(/^https:\/\//);
  });
  it('Service JSON-LD links back to Organization', () => {
    const json = serviceJsonLd('Custom Software', 'Bespoke web and back-end systems.');
    expect(json['@type']).toBe('Service');
    expect(json.provider['@type']).toBe('Organization');
  });
});
```

- [ ] **Step 2: Implement `src/lib/seo.ts`**

```ts
// SEO helpers — JSON-LD generators.

const SITE_URL = 'https://fermionsoftwaresolutions.com';

export interface OrganizationJsonLd {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  description: string;
}

export function organizationJsonLd(): OrganizationJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Fermion Software Solutions',
    url: SITE_URL,
    logo: `${SITE_URL}/fss-logo.png`,
    description: 'Custom software, ML, automation, and cloud systems for teams that need real outcomes.'
  };
}

export interface ServiceJsonLd {
  '@context': 'https://schema.org';
  '@type': 'Service';
  name: string;
  description: string;
  provider: { '@type': 'Organization'; name: string; url: string };
}

export function serviceJsonLd(name: string, description: string): ServiceJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name, description,
    provider: { '@type': 'Organization', name: 'Fermion Software Solutions', url: SITE_URL }
  };
}
```

- [ ] **Step 3: Run — pass**

Run: `npm run test`

- [ ] **Step 4: Update `index.html` `<head>`**

Replace existing head with:

```html
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/png" href="./fss-logo.png" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Custom software, ML, automation, and cloud systems built around your business — by a small team that ships in weeks, not quarters." />
  <title>Fermion Software Solutions — Software built around your business</title>

  <meta property="og:title" content="Fermion Software Solutions" />
  <meta property="og:description" content="Software built around your business. Custom development, ML, RPA, cloud." />
  <meta property="og:image" content="https://fermionsoftwaresolutions.com/og.png" />
  <meta property="og:url" content="https://fermionsoftwaresolutions.com" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />

  <script type="application/ld+json" id="org-ld"></script>
</head>
```

- [ ] **Step 5: Inject JSON-LD at runtime in `main.ts`**

```ts
import { organizationJsonLd } from './lib/seo';
const orgScript = document.getElementById('org-ld');
if (orgScript) orgScript.textContent = JSON.stringify(organizationJsonLd());
```

- [ ] **Step 6: Update case page heads**

For each `pages/case-*.html`, add OG tags inside `<head>`:

```html
<meta property="og:title" content="<Client> — Fermion case study" />
<meta property="og:description" content="<tagline>" />
<meta property="og:image" content="https://fermionsoftwaresolutions.com/og.png" />
<meta name="twitter:card" content="summary_large_image" />
```

(Hardcode per page for v1.)

- [ ] **Step 7: Commit**

```bash
git add src/lib/seo.ts tests/seo.test.ts src/main.ts index.html pages
git commit -m "feat(seo): meta tags + JSON-LD Organization markup"
```

---

## Task 31: OG image + sitemap + robots.txt

**Files:**
- Create: `public/og.png`
- Create: `public/robots.txt`
- Create: `scripts/build-sitemap.ts`
- Modify: `package.json`

- [ ] **Step 1: Generate OG image**

Take a 2400×1260 screenshot of the hero atom + nav at full quality, downscale to 1200×630, save as `public/og.png`. Keep file under 500KB.

- [ ] **Step 2: `public/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://fermionsoftwaresolutions.com/sitemap.xml
```

- [ ] **Step 3: Sitemap generator**

`scripts/build-sitemap.ts`:

```ts
// Build-time sitemap generator. Reads case-studies content, emits sitemap.xml.

import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { CASE_STUDIES } from '../src/content/case-studies';

const SITE = 'https://fermionsoftwaresolutions.com';
const today = new Date().toISOString().slice(0, 10);

const urls = [
  { loc: `${SITE}/`, priority: '1.0' },
  ...CASE_STUDIES.map((c) => ({ loc: `${SITE}/pages/case-${c.slug}.html`, priority: '0.7' }))
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>`;

writeFileSync(resolve(__dirname, '../public/sitemap.xml'), xml);
console.log(`Wrote sitemap with ${urls.length} entries.`);
```

- [ ] **Step 4: Wire into build**

```bash
npm install -D tsx
```

In `package.json` `scripts`:

```json
"prebuild": "tsx scripts/build-sitemap.ts",
"build": "tsc -b && vite build"
```

- [ ] **Step 5: Build + verify**

Run: `npm run build`
Expected: `public/sitemap.xml` appears; ends up in `dist/`.

- [ ] **Step 6: Commit**

```bash
git add public/og.png public/robots.txt scripts/build-sitemap.ts package.json package-lock.json
git commit -m "feat(seo): OG image, robots.txt, sitemap generator"
```

---

## Task 32: Lighthouse CI + Playwright smoke

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `lighthouserc.json`
- Create: `playwright.config.ts`
- Create: `tests/smoke.spec.ts`
- Modify: `package.json`

- [ ] **Step 1: Install**

```bash
npm install -D @playwright/test @lhci/cli
npx playwright install chromium
```

- [ ] **Step 2: Playwright config**

`playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  webServer: {
    command: 'npm run preview -- --port 4173',
    port: 4173,
    timeout: 60_000
  },
  use: { baseURL: 'http://localhost:4173' }
});
```

- [ ] **Step 3: Smoke test**

`tests/smoke.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('index loads, scrolls, form errors on bad input', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1').first()).toContainText(/Software built/);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.fill('input[name="name"]', 'A');
  await page.fill('input[name="email"]', 'bad-email');
  await page.fill('textarea[name="project"]', 'short');
  await page.click('button[type="submit"]');
  await expect(page.locator('.form-status.err')).toBeVisible();
});

test('case study page loads', async ({ page }) => {
  await page.goto('/pages/case-swedteknik.html');
  await expect(page.locator('h1')).toContainText('SwedTeknik');
});
```

- [ ] **Step 4: Lighthouse config**

`lighthouserc.json`:

```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:4173/", "http://localhost:4173/pages/case-swedteknik.html"],
      "startServerCommand": "npm run preview -- --port 4173",
      "numberOfRuns": 1
    },
    "assert": {
      "assertions": {
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "categories:performance": ["warn", { "minScore": 0.85 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }]
      }
    }
  }
}
```

- [ ] **Step 5: Add scripts to `package.json`**

```json
"test:e2e": "playwright test",
"lhci": "lhci autorun"
```

- [ ] **Step 6: GitHub Actions**

`.github/workflows/ci.yml`:

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - run: npx playwright install chromium
      - run: npm run test:e2e
      - run: npm run lhci
```

- [ ] **Step 7: Run locally**

```bash
npm run build
npm run test:e2e
npm run lhci
```

Expected: smoke passes; LHCI may warn on perf if 3D scene is heavy — tune until LCP and a11y assertions pass.

- [ ] **Step 8: Commit**

```bash
git add playwright.config.ts lighthouserc.json .github tests/smoke.spec.ts package.json package-lock.json
git commit -m "ci: Playwright smoke + Lighthouse CI"
```

---

## Task 33: Cloudflare Pages deploy

**Manual prerequisites:**
- Cloudflare account, domain `fermionsoftwaresolutions.com` added.
- Resend account + verified domain.
- Cal.com account + event slug.

**Files:**
- Create: `wrangler.toml`

- [ ] **Step 1: Connect repo to Cloudflare Pages**

In CF dashboard: Workers & Pages → Create → Pages → Connect to Git → select `fss-website` repo.

Build settings:
- Framework preset: None
- Build command: `npm run build`
- Build output directory: `dist`
- Environment variables (Production):
  - `RESEND_API_KEY` = real key
  - `CONTACT_TO_EMAIL` = `shubhjani1999@gmail.com`
  - `VITE_PLAUSIBLE_DOMAIN` = `fermionsoftwaresolutions.com`

- [ ] **Step 2: `wrangler.toml`**

```toml
name = "fss-website"
compatibility_date = "2026-05-01"
pages_build_output_dir = "dist"
```

- [ ] **Step 3: Trigger first deploy**

Push the branch. CF builds, deploys to `<project>.pages.dev`.

- [ ] **Step 4: Smoke the live preview**

Visit the preview URL. Submit the form (should now actually email Shubh + auto-reply). Click "Book a call" → real Cal.com modal.

- [ ] **Step 5: Custom domain**

CF Pages → Custom domains → add `fermionsoftwaresolutions.com` and `www.`. Auto-TLS.

- [ ] **Step 6: Commit**

```bash
git add wrangler.toml
git commit -m "chore: Cloudflare Pages deploy config"
git push
```

---

## Task 34: Final checklist & launch

**No code change — gate before pointing the world at it.**

- [ ] **Step 1: QA on the live deploy:**
  - Hero atom renders with shader.
  - Scroll through every scene; reduce-motion toggle flips correctly.
  - Click 3 service tags, 3 process pills, 3 case-study cards, 3 tier CTAs.
  - Submit a real form entry; confirm both notification + auto-reply land.
  - Book a call via Cal.com modal.
  - Check OG card on https://www.opengraph.xyz/.
  - Visit `/sitemap.xml` and `/robots.txt`.
  - Visit `/lol-not-real` → 404 page renders.
  - Lighthouse on live URL: LCP < 2.5s, A11y > 90, Best practices > 90.
- [ ] **Step 2: Replace case-study placeholders.** Edit `src/content/case-studies.ts` for `case-two` and `case-three`; update `pages/case-two.html` + `pages/case-three.html` titles + descriptions.
- [ ] **Step 3: Replace testimonial placeholder.** Real quote into `src/content/testimonials.ts`.
- [ ] **Step 4: Confirm pricing copy** in `src/content/tiers.ts`.
- [ ] **Step 5: Submit sitemap to Google Search Console.**
- [ ] **Step 6: Tag the release.**

```bash
git tag -a v1.0.0 -m "Cinematic + conversion enhancement live"
git push --tags
```

- [ ] **Step 7: Quick audit a week later.** Plausible: visits → form_submit. If conversion is low, iterate on tier copy first, then the form prompt, then form placement. Don't iterate before there's data.

---

## Spec coverage check

| Spec # | Item | Task |
|---|---|---|
| 1 | Lenis smooth scroll | Task 6 |
| 2 | pmndrs/postprocessing | Task 5 |
| 3 | prefers-reduced-motion | Tasks 4 + 8 |
| 4 | Mobile scene config | Tasks 3 + 7 |
| 5 | GLSL fermion shader (★) | Tasks 9 + 10 |
| 6 | Scroll-driven DOF | Task 11 |
| 7 | Loading intro sequence | Task 12 |
| 8 | BatchedMesh constellation | Task 15 |
| 9 | Click-to-expand service detail | Task 16 |
| 10 | Click-to-open step detail | Task 17 |
| 11 | Low-poly continents | Task 18 |
| 12 | Animated arc travel + pulses | Task 18 |
| 13 | Case study section (★) | Tasks 19, 20, 22 |
| 14 | Logo wall / testimonial | Task 23 (stat row variant) |
| 15 | Real contact form (★) | Tasks 25, 26 |
| 16 | Cal.com embed | Task 27 |
| 17 | Engagement tiers | Task 24 |
| 18 | SEO + JSON-LD | Tasks 30, 31 |
| 19 | Plausible analytics | Task 28 |
| 20 | 404 page | Task 21 |

All 20 covered. Test harness (Task 1), scene split (Task 2), QA gates (Tasks 13, 29), CI (Task 32), deploy (Task 33), launch checklist (Task 34) sit alongside.

---

## Final notes

- Phases ship green. If time runs out at any phase boundary, the site at that point is launchable.
- TDD where it pays — quality detection, motion mode, content shape, form validation, SEO helpers, contact function. Visual / shader / 3D work goes through manual browser QA.
- Frequent commits: every task ends with one. No batching at end-of-phase.
- Manual prerequisites that gate phases:
  - **Phase 4:** Real case-study content for `case-two` and `case-three` (gate Tasks 19 + 20).
  - **Phase 5:** Cal.com event slug (gate Task 27).
  - **Phase 5:** Resend API key + verified domain (gate Task 26).
  - **Phase 6:** Cloudflare account + DNS (gate Task 33).
- Cross-task ordering note: Task 22 imports `track` from `src/lib/analytics.ts` (Task 28). If running strictly sequentially, either build Task 28 first, or stub the import in Task 22 and uncomment after Task 28 lands. Task 25 has the same coupling. Either is a 5-minute delta.
