# FSS Editorial Redesign — Design Spec

**Date:** 2026-05-10
**Direction:** Pivot from cinematic-spectacle to editorial-content. Keep the GLSL atom as a 6-second hero signature; let the substance carry below the fold.
**Source motivation:** Cinematic site impresses but doesn't sell. B2B services buyers want to self-qualify in <30 seconds, then book a call.

## Goal

Strip the spectacle, surface the substance. The site becomes a content-forward, trust-forward editorial site for a small custom-software shop. The atom is a 6-second technical-chops signal at the top; everything below is text, faces, numbers.

## What gets cut

- 3D service constellation (14 nodes, cluster lines, service tags as 3D-projected DOM)
- Pipeline 3D scene (Catmull-Rom curve, glowing waypoints, traveling packets)
- Wireframe globe (continent outlines, dot markers, arc pulses)
- Grid floor
- Particle field (1400 ambient motes)
- Master GSAP scroll-driven camera timeline (`src/timeline.ts`)
- Lenis smooth scroll (overengineered for an editorial scroll)
- Scroll-driven DOF (no scenes to focus through)
- Loading intro sequence
- Reduce-motion footer toggle (CSS-level prefers-reduced-motion stays)

## What stays

- GLSL fermion atom — same shader, hero-only, ~50vh, fades on scroll past
- Cyan-on-navy palette + token system (`--bg`, `--cyan`, `--ink`, etc.)
- Quality detection (`src/scene/quality.ts`)
- Bloom postfx (just on the atom)
- `prefers-reduced-motion` CSS (no manual toggle)
- Multi-page setup (case studies as separate editorial pages)
- 404 page
- Contact form + Pages Function (Resend)
- Cal.com booking embed
- Plausible analytics + event tracking
- Service content data (rendered as a list now, not a constellation)
- Process content data (numbered editorial list)
- Case studies, testimonials, tiers content

## What's new

- **Editorial homepage** with this section order:
  1. Hero — atom + one-line headline + sub-headline
  2. Positioning — single-paragraph "what we do, who for"
  3. Selected work — 3 case study cards with cover images
  4. Services — categorized list (Build / Run / Grow), each item clickable for detail
  5. How we work — process as a numbered editorial list (5 steps)
  6. About Shubh — photo + bio
  7. Notes — 3 article cards (placeholders link to `/notes/<slug>` for v1.1)
  8. Tiers — engagement shapes
  9. Contact — form + booking + email link
- Sharper positioning copy (replaces "Custom development, machine learning, RPA, cloud, and more" generic blob)
- Sticky "Book a call" floating CTA, bottom-right on desktop, hidden on mobile (pre-empts the form)
- New: `src/content/about.ts` (one entry: name, role, bio, photo path)
- New: `src/content/notes.ts` (3 placeholder note entries with title, blurb, date)
- New: `src/ui/services-list.ts` — replaces 3D constellation with categorized DOM list
- New: `src/ui/process-list.ts` — replaces 3D pipeline with numbered editorial list
- New: `src/ui/about.ts` — photo + bio block
- New: `src/ui/notes-cards.ts` — 3-card grid

## Out of scope

- Real `/notes/<slug>` blog pages (placeholder cards only; v1.1)
- Real photo of Shubh (placeholder image for v1; Shubh provides)
- Real client logos / additional testimonials beyond existing content
- Search, RSS, sitemap of notes (added when notes go live in v1.1)

## Architecture impact

```
src/
├── content/
│   ├── services.ts           ← KEEP
│   ├── process.ts            ← KEEP
│   ├── case-studies.ts       ← KEEP
│   ├── testimonials.ts       ← KEEP
│   ├── tiers.ts              ← KEEP
│   ├── about.ts              ← NEW
│   └── notes.ts              ← NEW
├── objects/
│   ├── atom.ts               ← KEEP (resized hero only)
│   └── atom-shader/          ← KEEP
│   ├── grid.ts               ← DELETE
│   ├── services.ts           ← DELETE
│   ├── pipeline.ts           ← DELETE
│   ├── globe.ts              ← DELETE
│   └── particles.ts          ← DELETE
├── scene/
│   ├── stage.ts              ← KEEP, simplified
│   ├── postfx.ts             ← KEEP, bloom only
│   ├── quality.ts            ← KEEP
│   └── motion.ts             ← KEEP (CSS uses it)
├── ui/
│   ├── service-detail.ts     ← KEEP (open from list click instead)
│   ├── case-cards.ts         ← KEEP
│   ├── tiers.ts              ← KEEP
│   ├── form.ts               ← KEEP
│   ├── booking.ts            ← KEEP
│   ├── trust-row.ts          ← KEEP, refactor placement
│   ├── motion-toggle.ts      ← DELETE
│   ├── overlays.ts           ← DELETE (3D→DOM projection no longer needed)
│   ├── step-detail.ts        ← DELETE (process is a flat list now)
│   ├── services-list.ts      ← NEW
│   ├── process-list.ts       ← NEW
│   ├── about.ts              ← NEW
│   ├── notes-cards.ts        ← NEW
│   └── floating-cta.ts       ← NEW
├── lib/
│   ├── dom.ts                ← KEEP
│   ├── analytics.ts          ← KEEP
│   ├── seo.ts                ← KEEP
│   └── lenis.ts              ← DELETE
├── timeline.ts               ← DELETE
├── styles.css                ← REWRITE (editorial typography + grid)
├── styles-case.css           ← KEEP
├── case-page.ts              ← KEEP
├── not-found.ts              ← KEEP
└── main.ts                   ← REWRITE (much smaller; mounts atom + sections)
```

## Mobile

Editorial layouts reflow naturally. Atom stays at the top but smaller. Sticky "Book a call" hidden on `<720px`. Sections stack with reduced padding. Case-card grid drops to one column.

## Performance

Goal: LCP < 1.5s on 4G (was < 2.0s). Removing the particle field, three.js scene assemblies, GSAP scroll timeline, and Lenis cuts >300KB raw / ~100KB gzipped. The atom + bloom is the only meaningful runtime cost.

## Manual prereqs before launch

1. Photo of Shubh for the About section (`public/about/shubh.jpg`, 800×800 minimum, square crop)
2. Real bio copy in `src/content/about.ts`
3. SwedTeknik case study real result numbers (the existing entry has placeholder metrics)
4. Two more case studies (`case-two`, `case-three`) — same as the prior spec, still pending
5. Pick the positioning wedge — "We build custom software for X" — Shubh fills the X. Suggested: "small teams in commerce / fintech / SaaS that need real systems, not slideware."
