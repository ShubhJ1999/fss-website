// Engagement tiers shown on the pricing block. Anchor prices visible per spec.

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
