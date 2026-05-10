// Engagement tiers. Pricing + fit copy left as placeholders for Shubh + Dhruv to set.

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
    pitch: 'PLACEHOLDER pitch — short engagement shape.',
    fit: [],
    duration: 'PLACEHOLDER duration',
    pricing: 'PLACEHOLDER pricing',
    cta: { label: 'Start a Sprint', href: '#contact' }
  },
  {
    name: 'Build',
    pitch: 'PLACEHOLDER pitch — full project shape.',
    fit: [],
    duration: 'PLACEHOLDER duration',
    pricing: 'PLACEHOLDER pricing',
    cta: { label: 'Scope a Build', href: '#contact' },
    featured: true
  },
  {
    name: 'Embed',
    pitch: 'PLACEHOLDER pitch — retainer shape.',
    fit: [],
    duration: 'PLACEHOLDER duration',
    pricing: 'PLACEHOLDER pricing',
    cta: { label: 'Embed with us', href: '#contact' }
  }
];
