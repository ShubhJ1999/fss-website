// Engagement tiers — three ways to work with Fermion. Pricing is intentionally
// "Quoted on call" so scope drives the number, not a published list.

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
    pitch: 'A focused two-week engagement to de-risk an idea, ship a prototype, or audit an existing system.',
    fit: [
      'Validate an idea before committing to a build',
      'Spike a hard technical problem with a working demo',
      'Architecture or code review on an existing codebase'
    ],
    duration: '1–2 weeks',
    pricing: 'Fixed fee · quoted on call',
    cta: { label: 'Start a Sprint', href: '#contact' }
  },
  {
    name: 'Build',
    pitch: 'Discovery to deployment for a complete product or major feature, run by the founders end-to-end.',
    fit: [
      'New product MVP or full SaaS build',
      'Replace a legacy system with something modern',
      'Add a substantial new module to an existing platform'
    ],
    duration: '6–10 weeks typical',
    pricing: 'Milestone-based · quoted on call',
    cta: { label: 'Scope a Build', href: '#contact' },
    featured: true
  },
  {
    name: 'Embed',
    pitch: 'Ongoing senior engineering capacity embedded with your team for steady feature delivery and reliability.',
    fit: [
      'You need senior hands without the headcount',
      'Steady feature pipeline with weekly demos',
      'On-call ownership for production systems'
    ],
    duration: '3-month minimum, monthly renewal',
    pricing: 'Monthly retainer · quoted on call',
    cta: { label: 'Embed with us', href: '#contact' }
  }
];
