// Process step content used by the pipeline detail panels.
// Mirrors the five-stage pipeline copy: Discovery → Design → Build → Ship → Support.

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
