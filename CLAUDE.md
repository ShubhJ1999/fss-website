# Fermion Software Solutions — Marketing Site

A single-page cinematic site. One pinned WebGL canvas behind the page, six scroll-driven scenes layered on top. The whole thing exists to make Fermion (a small custom-software shop) feel substantial in 30 seconds of scroll.

The hero is an atom. Not a logo, not a hero image — a glowing core with three orbital rings, called a "fermion" (one subatomic particle, single, not multiple). Everything downstream builds off that visual identity.

---

## Stack

- **Vite 5** — dev server, ES2022 build, base set to `./` so it can ship as a static folder.
- **TypeScript 5.5** — strict, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`. No `any`.
- **three.js 0.169** — single persistent scene reused across all scroll regions. No React, no react-three-fiber.
- **GSAP 3.12 + ScrollTrigger** — one master timeline scrubbed by page scroll. No per-section timelines.

Build: `tsc -b && vite build`. Output to `dist/`. No SSR, no router, no framework.

---

## How the site works

There is exactly one Three.js scene. It contains every object the user will ever see — atom, grid, services, pipeline, globe, particles. The camera moves through this scene as the user scrolls.

The DOM is just six `<section class="scene">` blocks stacked vertically inside `#scroll`. Each section is sized to roughly one viewport and exists only to give ScrollTrigger something to drive against. Copy lives in those sections; visuals live on the canvas behind.

A single GSAP timeline (`src/timeline.ts`) ties scroll progress to:
- camera position (`cam.position`)
- lookAt (via a `lookProxy` object so GSAP can tween the target Vector3)
- per-object `visible` toggles
- occasional scale/position tweaks on individual groups

Objects that aren't yet on screen have `visible = false` until the timeline flips them on. This keeps the GPU off when nothing's happening with them.

The render loop runs continuously in `main.ts` — every frame it calls `tick(t)` on each object (small per-object animation: rotations, orbits, packet movement) and renders through the EffectComposer (RenderPass + UnrealBloomPass for the cyan glow).

Service tag labels are DOM elements (`.service-tag`) projected from 3D world positions to 2D screen coordinates each frame. Text stays crisp; the canvas does the spectacle.

---

## Scroll choreography (scene-by-scene)

| Scroll position | Scene | What happens |
|---|---|---|
| 0 | `hero` | Atom centered, camera at z=8. "Software built around your business." |
| 0 → 1 | `intro` | Atom shrinks and drops. Grid floor rises into frame. |
| 1 → 2 | `services` (Build cluster) | Atom shrinks further. Camera banks left to fly past Build nodes. |
| 2 → 3 | `services` (Run cluster) | Camera pushes deeper past Run nodes. |
| 3 → 4 | `services` (Grow cluster) | Camera arcs right past Grow nodes. |
| 4 → 5 | `process` | Pipeline appears. Camera lines up at the start of the curve. |
| 5 → 6 | `process` (travel) | Camera follows the pipeline curve while packets flow through. |
| 6 → 7 | `globe` (approach) | Camera descends toward the wireframe globe at z≈-85. |
| 7 → 8 | `globe` (settle) | Camera holds on the globe. |
| 8 → 9 | `contact` | Camera lifts to y=18 looking down. Globe shrinks; copy gets a radial-gradient backdrop so it reads against any visual under it. |

The timeline labels (`0`, `1`, `2`...) are arbitrary GSAP positions, not normalized 0–1. ScrollTrigger maps total scroll length to total timeline length automatically.

---

## File layout

```
fss-website/
├── index.html              ← Six <section> blocks + nav + canvas mount
├── public/fss-logo.png     ← Favicon
├── src/
│   ├── main.ts             ← Bootstrap, mount, render loop. Thin.
│   ├── scene.ts            ← Stage: renderer, scene, camera, lights, bloom composer, WebGL fallback
│   ├── timeline.ts         ← Master GSAP/ScrollTrigger timeline. All camera/visibility choreography.
│   ├── styles.css          ← Single global stylesheet. CSS variables for color tokens.
│   ├── objects/
│   │   ├── atom.ts         ← Hero core + 3 orbital rings + orbiters
│   │   ├── grid.ts         ← Receding floor + horizon glow
│   │   ├── services.ts     ← 14 nodes in 3 clusters (Build/Run/Grow), connecting lines, exposes positions for label projection
│   │   ├── pipeline.ts     ← 5-waypoint Catmull-Rom curve + tube + traveling packets
│   │   ├── globe.ts        ← Wireframe sphere + city dots + bezier arcs between them
│   │   └── particles.ts    ← 1400-point ambient field for parallax depth
│   └── ui/
│       └── overlays.ts     ← 3D→2D projection of service-node positions to DOM tags
├── tsconfig.json
├── vite.config.ts
└── package.json
```

Every `.ts` file starts with two comment lines describing what it is and why it exists. Keep that convention.

---

## Object module contract

Each object module exports a `create*()` factory returning at minimum:

```ts
export interface Foo {
  group: THREE.Group;          // attach to stage.scene
  tick: (t: number) => void;   // called every frame in main.ts loop
}
```

`main.ts` adds the `group` to the scene, the timeline reads the `group` to flip visibility / move it / scale it, and the render loop calls `tick(elapsedSeconds)` for the small constant motion (orbits, drifts, breathing scales).

Don't put scroll-driven motion inside `tick`. That belongs in `timeline.ts`. `tick` is for the always-on idle animation that should keep going whether you're scrolling or not.

If the object exposes data the timeline or overlays need (e.g. `services` exposes its `nodes[]` so labels can be projected), put it on the returned interface — don't reach into `group.children`.

---

## Visual identity / tokens

Defined in `:root` in `src/styles.css`:

- `--bg: #050b2e` — deep navy. Also the scene background color and fog color in `scene.ts`. If you change one, change both.
- `--cyan: #2ec8ff` — primary accent. Wireframes, kickers, CTA border, bloom glow.
- `--cyan-soft: #6fdcff` — emissive highlights, orbiters, packet cores.
- `--blue: #1f6ee8` — fill light, secondary emissive.
- `--ink: #f4f7ff` / `--ink-dim: #aab4d4` — body copy.

Bloom is tuned in `scene.ts`: strength 0.65, radius 0.7, threshold 0.18. Bumping threshold below 0.15 will make text glow, which looks cheap.

Tone mapping: ACESFilmic, exposure 1.05. Output color space: sRGB.

---

## Conventions

- Strict TypeScript. No `any`. No non-null assertions unless guarded.
- Files under 300 lines. If something grows past that, split by responsibility, not by line count.
- One responsibility per file. Don't put another object's logic in `atom.ts` because they share a material color.
- No comments that restate the code. Two-line file header explaining purpose, plus genuinely-helpful inline comments only where the *why* is non-obvious. Don't narrate.
- DOM overlays go through `ui/overlays.ts`. Don't manipulate `.service-tag` from object modules.
- All scroll-driven motion goes through `timeline.ts`. Object modules don't know about scroll.
- Don't introduce new dependencies without checking with Shubh first. The whole point is a tiny static bundle.

---

## Adding a new scene

1. Add a `<section class="scene" data-scene="newname">` to `index.html` with copy in a `.copy` div.
2. (If 3D) Build the object in `src/objects/newname.ts` exporting `{ group, tick }`.
3. In `main.ts`: import the factory, call it, add `obj.group` to `stage.scene`, call `obj.tick(t)` in the loop.
4. In `timeline.ts`: import the type, add a parameter to `SceneRefs`, add a tween block at the next free integer label. Set `visible = true` at the entry point, animate camera/lookProxy with `power2.inOut` for transitions and `'none'` for sustained flythroughs.
5. If it has DOM labels, extend `ui/overlays.ts` — don't reach into the DOM from object modules.

Test the whole scroll sequence after adding. New scenes change total scroll length, which can make earlier scenes feel rushed. Re-tune by adjusting the `min-height` of existing `.scene` blocks in `styles.css`.

---

## Adding a service to the constellation

Append to the `SERVICES` array in `src/objects/services.ts` with one of `Build` / `Run` / `Grow` as the cluster. Layout is deterministic from the array order — no manual positioning needed. The label mounts automatically via `mountServiceTags`.

If a cluster grows past ~6 items it'll start overlapping. At that point, bump `r` (the ring radius) inside the layout loop, or split the visual into two rings.

---

## Run commands

```sh
npm install
npm run dev      # vite dev server on :5173
npm run build    # tsc -b && vite build → dist/
npm run preview  # serve dist/ locally
```

Static deploy: ship `dist/` to anything (Netlify, Vercel static, S3+CloudFront, GitHub Pages). `base: './'` in `vite.config.ts` keeps it path-agnostic.

---

## Things to not do

- Don't add React / Vue / Svelte. The whole site is ~6 sections. A framework would be overkill and would force re-architecting the canvas-as-background model.
- Don't replace GSAP ScrollTrigger with a custom IntersectionObserver scroll sync. Scrubbed timelines need sub-frame accuracy.
- Don't move objects from the persistent scene into per-section scenes. The reuse is the whole point — it's why the camera can fly through everything continuously.
- Don't add `pointer-events: auto` to `.copy` blocks. Copy is non-interactive on purpose so the canvas can own the cursor for any future drag/orbit feature.
- Don't tween `cam.lookAt(target)` directly. GSAP can't tween methods. Tween the `lookProxy` object and call `cam.lookAt` in the timeline's `onUpdate` (already wired).
- Don't bump `renderer.setPixelRatio` past 2. The bloom pass at 3x retina kills mobile GPUs.
- Don't remove the WebGL fallback in `scene.ts`. Some corp browsers still ship without hardware acceleration.

---

## Known limits / open work

- No reduced-motion handling. Should detect `prefers-reduced-motion` and either disable the scroll scrub or replace the canvas with static stills.
- No mobile-specific tuning. The 1400 particles + bloom pass runs hot on older phones. A `<720px` branch in `particles.ts` and a softer bloom would help.
- No analytics, no contact form. The CTA is a `mailto:`. If a form goes in, it should hit a serverless function — don't introduce a backend service.
- The globe positions are hand-rolled lat/lng. Fine for now; if the client list grows past ~8 cities, move to a JSON file.
