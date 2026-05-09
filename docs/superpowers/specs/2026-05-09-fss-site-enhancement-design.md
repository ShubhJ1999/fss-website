# FSS Site Enhancement — Design Spec

**Date:** 2026-05-09
**Owner:** Shubh Jani
**Direction:** A + D (cinematic, cranked + conversion-first)
**Repo:** `fss-website` (Vite + TypeScript + three.js + GSAP)

## Goal

Take the current cinematic scroll site from "tutorial-shaped" to "premium boutique studio that books calls." Two halves:

1. **Cinematic, cranked.** Push the visual identity past where it currently sits. The atom becomes a real signature visual, not a bloomed icosahedron. Scroll feels intentional. Mobile and reduced-motion users get something good, not a degraded fallback.
2. **Conversion-first.** Add the closing machinery the site currently has zero of: real case studies, a real form, a calendar booking, trust signals, SEO, and analytics. Without these, the spectacle is wasted.

Reference targets: Lusion (scene continuity), Studio Freight (scroll feel), Ultranoir (spectacle attached to conversion), 14islands (hero spectacle / editorial body ratio).

Anti-goals: Bruno Simon's playground vibe, Resn-volume effects, art-school portfolio energy. Fermion is selling reliability, not whimsy.

## Scope

20 enhancements, grouped:

### 1. Tech foundation
1. **Lenis smooth scroll** — replace native scroll with Lenis 1.x, drive GSAP's RAF from it.
2. **pmndrs/postprocessing migration** — swap `UnrealBloomPass` for the merged-pass `EffectComposer` from `postprocessing`. Adds DOF and chromatic aberration cheaply.
3. **prefers-reduced-motion path** — render one settled frame per scene, skip scrub. Manual "reduce motion" toggle in the footer (localStorage-backed).
4. **Mobile scene config** — separate config object selected at boot. Drops bloom, halves particles, dpr cap 1.5.

### 2. Hero / atom (the headline upgrade)
5. **Custom GLSL fermion shader (★)** — animated noise core + fresnel rim + energy-shell distortion. Raw GLSL via `THREE.ShaderMaterial` (not TSL). Replaces the bloomed icosahedron.
6. **Scroll-driven depth-of-field** — focus point tracks the active scene. Distant objects blur during transitions.
7. **Loading intro sequence** — atom assembles from particles on first paint. Hides the WebGL boot.

### 3. Service constellation
8. **BatchedMesh for nodes** — one draw call for all 14 nodes (three.js r166+).
9. **Click-to-expand service detail** — clicking a service tag opens a side panel with: what we do, sample stack, typical timeline, sample work.

### 4. Pipeline / process
10. **Click-to-open step detail** — each waypoint (Discovery / Design / Build / Ship / Support) opens a panel with: what we deliver, typical duration, what you receive.

### 5. Globe / reach
11. **Low-poly continents wireframe** — thin continent outlines on the sphere. Reads as Earth, not a math object.
12. **Animated arc travel + city pulses** — pulses fly between cities along arcs on a loop.

### 6. Conversion content
13. **Case study section (★)** — 3 cards: SwedTeknik, plus two more (TBD by Shubh). Each card opens a detail page with problem → approach → result.
14. **Logo wall + 1-2 testimonial pull-quotes** — 4-5 client logos at low opacity, one real quote.
15. **Real contact form (★)** — POST to a serverless function backed by Resend. Auto-reply to lead, notification to Shubh.
16. **Cal.com or Calendly embed** — "Book a 30-min intro call" button alongside the form.
17. **Engagement tiers / pricing block** — three cards. Initial sketch (final copy in implementation):
    - **Sprint** (1-2 wk) — discovery, prototype, tech audit, or one-feature MVP. From a fixed price.
    - **Build** (4-8 wk) — full project from spec to ship. Scoped quote.
    - **Embed** (retainer) — ongoing support, ML/RPA operations, fractional engineering. Monthly.

### 7. Foundations
18. **SEO** — meta tags, Open Graph card (with rendered atom as og:image), sitemap.xml, robots.txt, JSON-LD Organization + Service markup.
19. **Privacy-friendly analytics** — Plausible (or Umami self-hosted). One script tag, no cookie banner.
20. **404 page** — `404.html` with a small canvas and a drifting particle.

## Out of scope

Explicitly not in this spec:

- Audio (ambient drone, sound toggle).
- Theme variants (daytime mode, light theme).
- Live mini-sandbox / playground embed.
- Multi-language support.
- Blog / writing section.
- CMS integration. All content lives as TypeScript const arrays.
- React / framework migration. Vanilla three.js + DOM stays.
- TSL rewrite of existing GLSL. Use TSL only for new shaders if at all.
- WebGPU. Stay on WebGL2.
- Gaussian splats, volumetric clouds, anything > 2MB extra payload.

If any of the above turn out to matter, they get their own spec.

## Architecture impact

### Current shape (preserve)

- One persistent `THREE.Scene` reused across scroll regions.
- One master GSAP timeline scrubbed by ScrollTrigger.
- Object modules export `{ group, tick }` and live in `src/objects/`.
- DOM overlays project 3D positions to 2D screen coords in `src/ui/overlays.ts`.
- All scroll-driven motion lives in `src/timeline.ts`.
- Object modules don't know about scroll.

These rules survive intact. Everything new layers on top.

### New shape (additions)

```
src/
├── content/                    ← NEW: structured content
│   ├── services.ts             ← move SERVICES from objects/services.ts here, expand with detail
│   ├── process.ts              ← Discovery/Design/Build/Ship/Support detail
│   ├── case-studies.ts         ← 3 case studies
│   ├── testimonials.ts
│   └── tiers.ts                ← engagement tiers
├── objects/
│   ├── atom-shader/            ← NEW: GLSL fermion
│   │   ├── atom.vert.glsl
│   │   ├── atom.frag.glsl
│   │   └── material.ts         ← ShaderMaterial factory
│   ├── globe-continents.ts     ← NEW: continent outlines on sphere
│   └── (existing)              ← grid, pipeline, particles, services updated
├── scene/
│   ├── stage.ts                ← split from current scene.ts: renderer, camera, lights
│   ├── postfx.ts               ← NEW: pmndrs EffectComposer + bloom/DOF/chromatic
│   ├── quality.ts              ← NEW: device tier detection + quality config
│   └── motion.ts               ← NEW: prefers-reduced-motion + manual toggle state
├── ui/
│   ├── overlays.ts             ← existing service-tag projection
│   ├── service-detail.ts       ← NEW: side panel for service click
│   ├── step-detail.ts          ← NEW: pipeline step modal
│   ├── case-study-card.ts      ← NEW: card section
│   ├── trust-row.ts            ← NEW: logos + testimonial
│   ├── tiers.ts                ← NEW: pricing block
│   ├── form.ts                 ← NEW: contact form + validation + submit
│   ├── booking.ts              ← NEW: Cal/Calendly embed
│   └── motion-toggle.ts        ← NEW: footer toggle
├── lib/
│   ├── lenis.ts                ← NEW: Lenis init + GSAP RAF wiring
│   ├── reduced-motion.ts       ← NEW: media query + localStorage
│   └── seo.ts                  ← NEW: og/meta/json-ld helpers
├── pages/                      ← NEW: case study HTML entries (Vite multi-page)
│   ├── case-swedteknik.html
│   ├── case-two.html
│   └── case-three.html
└── main.ts                     ← orchestrates, stays thin

functions/
└── contact.ts                  ← NEW: Cloudflare Pages Function for form POST

public/
├── og.png                      ← NEW: 1200×630 OG card
├── logos/                      ← NEW: client logos
└── continents.json             ← NEW: low-poly continent topology
```

`scene.ts` splits into `scene/stage.ts` + `scene/postfx.ts` because the file would otherwise grow past the 300-line cap once the postfx and quality logic land.

### New module contracts

**`src/scene/quality.ts`**
```ts
export type Tier = 'mobile' | 'low' | 'mid' | 'high';
export interface Quality {
  tier: Tier;
  dprCap: number;
  particleCount: number;
  bloomEnabled: boolean;
  dofEnabled: boolean;
  chromaticEnabled: boolean;
}
export function detectQuality(): Quality;
```

Detection signals: `navigator.hardwareConcurrency`, `window.matchMedia('(max-width: 720px)')`, `window.matchMedia('(prefers-reduced-motion: reduce)')`. No GPU benchmarks at runtime — stay deterministic.

**`src/scene/motion.ts`**
```ts
export type MotionMode = 'full' | 'reduced';
export function getMotionMode(): MotionMode;
export function setMotionMode(mode: MotionMode): void; // persists to localStorage
export function onMotionChange(cb: (mode: MotionMode) => void): void;
```

The timeline reads `getMotionMode()` at build time. If `'reduced'`, it skips the scrub timeline and instead uses `gsap.set()` to land each scene's settled pose, swapping on `IntersectionObserver` instead of scroll progress.

**`src/lib/lenis.ts`**
```ts
export function initLenis(): { raf: (time: number) => void; destroy: () => void };
```

Drives GSAP's ticker. `gsap.ticker.lagSmoothing(0)` after init.

**`src/ui/form.ts`**
```ts
export interface FormFields { name: string; email: string; project: string; budget?: string; }
export function mountForm(root: HTMLElement, opts: { endpoint: string }): void;
```

Validates client-side, POSTs to `/api/contact`, shows inline success / error.

## Content model

All content as TypeScript const arrays in `src/content/`. No CMS.

**`src/content/services.ts`** (replaces the inline array in `objects/services.ts`):
```ts
export interface Service {
  slug: string;
  name: string;        // shown on the 3D tag
  cluster: 'Build' | 'Run' | 'Grow';
  blurb: string;       // one-line for panel
  body: string[];      // paragraphs for panel
  stack: string[];     // sample tools/frameworks
  timeline: string;    // e.g. "2-6 weeks"
  sample?: { name: string; href: string };
}
```

`objects/services.ts` imports from `content/services.ts`, builds the 3D constellation. The detail panel (`ui/service-detail.ts`) reads the same array.

**`src/content/process.ts`** mirrors the pipeline waypoints with `name`, `blurb`, `deliverables: string[]`, `duration`.

**`src/content/case-studies.ts`**:
```ts
export interface CaseStudy {
  slug: string;        // matches pages/case-<slug>.html
  client: string;
  tagline: string;
  cover: string;       // /public path
  problem: string;
  approach: string[];
  result: { metric: string; value: string }[];
}
```

**`src/content/testimonials.ts`** and **`src/content/tiers.ts`** trivially typed.

## Routing / multi-page

Vite multi-page setup. `vite.config.ts` `build.rollupOptions.input` enumerates:

- `index.html` (the main site)
- `pages/case-<slug>.html` (one per case study)
- `404.html`

Case-study pages share the dark theme + nav but render a static editorial layout (no scroll-bound 3D scene). They're cheap, SEO-indexable, and link target for the case-study cards on the main page.

The 404 page mounts a tiny canvas with one drifting particle on a dark background. No bloom, no scene state.

## Form backend / hosting

Move hosting to **Cloudflare Pages**. Reasons:

- Free tier covers everything we need.
- Pages Functions run as Workers — can host the contact form without a separate service.
- Custom domain + auto-renewing TLS.
- Sub-100ms TTFB globally.

Function: `functions/contact.ts`. Receives `{ name, email, project, budget }`. Validates, calls Resend's REST API to (a) send Shubh a notification, (b) send the lead an auto-reply confirming receipt. Rate-limited by Cloudflare's built-in WAF, hCaptcha skipped for v1 (revisit if spam appears).

Resend domain verification needs DNS records on the Fermion domain — this is a one-time setup task before the form goes live.

Form failure modes:
- Network error: inline message "Couldn't send — try again or email support@fermionsoftwaresolutions.com directly."
- Validation error: inline per-field message.
- Rate-limited (429): "Slow down — try again in a minute."
- Resend API error: surface as network error, log to console, don't expose internals.

## Reduced motion + a11y plan

Two paths: OS-level (`prefers-reduced-motion`) and manual (footer toggle). The toggle is sticky (localStorage). When reduced:

- ScrollTrigger scrub timeline is not built.
- Scenes settle via `gsap.set()` triggered by `IntersectionObserver` per `.scene` block.
- Object `tick(t)` loops still run (idle motion is acceptable; it's not scroll-bound).
- The atom shader's noise time can be paused; rings stop rotating. Decision: keep idle motion on, just freeze the camera. Static-everything is too dead.

Other a11y:
- Form fields have associated labels and `aria-describedby` for errors.
- Focus rings honored, not stripped.
- Side panels are real `<dialog>` elements with focus trap and Esc-to-close.
- Color contrast: kicker `#2ec8ff` on `#050b2e` is 7.5:1 (passes AAA).
- All interactive 3D nodes have a corresponding clickable DOM tag (the existing `.service-tag` is already focusable; extend pipeline waypoints similarly).

## Mobile strategy

Detect at boot via `quality.ts`. Mobile config:

- `dpr` cap 1.5 (down from 2).
- Bloom off.
- DOF off.
- Particle count: 400 (down from 1400).
- Atom shader simplified (lower noise octaves).
- Pipeline tube tessellation halved.
- Globe sphere segments halved.
- Camera FOV widened slightly so scenes still frame well portrait.

Service detail panels become full-screen sheets on `< 720px`. Pipeline step panels likewise. Form is single-column.

## Performance budget

Hard targets, measured on a Moto G4 / 4G profile in Lighthouse:

- LCP < 2.0s
- INP < 200ms
- CLS = 0
- Total transferred (no cache) < 800KB gzipped
- WebGL first frame < 3.0s

Headroom plan:
- All textures < 256×256 unless explicitly needed bigger.
- Continent topology JSON < 50KB (use simplified-50 from world-atlas).
- HDRIs: none (lights only).
- No font files unless we need a non-system font; Inter via `system-ui` fallback or `@fontsource` with WOFF2 only.

## SEO

- `<title>` + `<meta description>` per page (case studies have unique titles).
- `<meta property="og:*">` set: title, description, image (`/og.png`), type, url.
- `<meta name="twitter:card" content="summary_large_image">`.
- `og.png`: 1200×630, render of the atom + "Fermion Software Solutions" lockup.
- `sitemap.xml`: index + all case studies. Build-time generation via a small script (no plugin).
- `robots.txt`: `Allow: /`, sitemap reference.
- JSON-LD `Organization` on the index, `Service` items per service, `Person` for Shubh on case studies that name him.

## Analytics

Plausible (cloud) by default. Configurable via `VITE_PLAUSIBLE_DOMAIN` env. If empty, no script loads. Events tracked:

- `pageview` (auto)
- `cta_email_click`
- `cta_book_click`
- `service_detail_open` (with service slug)
- `case_study_open` (with slug)
- `form_submit` (success / failure)

Dashboards: top entries, conversion funnel (page → form_submit), service interest distribution.

## Testing strategy

This is a marketing site, not a transactional app. Testing pyramid is intentionally inverted:

- **Manual visual QA** is the primary validation. Each PR ships a Cloudflare Pages preview URL; review the scroll on desktop, mobile, reduced-motion.
- **Lighthouse CI** on every PR for the index + one case study. Fails if LCP > 2.5s or CLS > 0.1.
- **TypeScript strict** catches structural mistakes.
- **Vitest** for: form validation, content shape (every service has required fields), SEO helpers. Skip 3D scene tests; not worth the rig.
- **Playwright smoke test** (one): index loads, scroll to bottom, form submit (mocked endpoint) shows success message. Runs in CI.

No visual regression tooling. The site is too animated; diffs would be noise.

## Migration / rollout plan

The implementation plan (next document) sequences these. High level: foundations first (Lenis, postfx swap, quality config, motion mode) so all subsequent work renders correctly across devices. Then the GLSL atom (high-impact, isolated). Then content additions. Form last — needs Resend + Cloudflare DNS work that's partially manual.

Each phase ships behind no flags. The site is small enough that "ship to preview, sanity-check, merge" is the right cadence. Main is always live.

**Spec scope note:** This is a single coherent enhancement effort, not multiple independent projects. It produces one phased implementation plan. Phases will be: (1) tech foundation, (2) hero / atom upgrade, (3) constellation + pipeline + globe upgrades, (4) conversion content + pages, (5) form + booking + tiers, (6) SEO / analytics / 404 / launch.

## Decisions on open questions

Shubh delegated these. Defaults below — flagged where override is cheap during implementation.

1. **Case studies: SwedTeknik + 2 placeholders.** Implementation builds the page template, navigation, and styling against placeholder content (`case-two`, `case-three` slugs). Shubh provides the real content during phase 4 by editing `src/content/case-studies.ts` and the corresponding `pages/case-<slug>.html`. SwedTeknik content gets drafted from what I already know (Next.js 15 + Medusa v2, B2C electronics, Sweden) and Shubh edits.
2. **Logos: stat row, not logos, for v1.** "Delivered to founders across 4 countries" + numeric stats. Avoids client-permission overhead. Real logo wall is a v1.1 follow-up once Shubh confirms which clients are public.
3. **Engagement tiers: visible anchors.**
   - Sprint — **from $4,000** (1-2 wk)
   - Build — **project-scoped** (4-8 wk, typical $15k-$60k range, no fixed price displayed)
   - Embed — **from $4,500/mo** (retainer)
   Placeholders Shubh confirms in `src/content/tiers.ts` before launch.
4. **Calendar: Cal.com.** Open-source, Shubh owns the data, self-host option later. Cloud free tier covers v1.
5. **Hosting: Cloudflare Pages.** Free tier, edge Functions for the contact form, sub-100ms TTFB, easy custom domain. Migration is `cf-pages-action` GitHub workflow + DNS swap when ready.
6. **Resend: Shubh creates account + verifies fermion domain.** Marked as a manual prerequisite gate in phase 5 of the plan. Dev/preview can use a sandbox API key + a `noreply@` test address.
7. **Analytics: Plausible cloud ($9/mo).** Lazy correct answer. Implementation reads `VITE_PLAUSIBLE_DOMAIN` env; empty = no script.

If any of the above are wrong, override during the relevant phase — none are load-bearing on architecture.
