// About the team behind Fermion. Single entry — Shubh, the founder.
// Text-only: no photo until Shubh provides one.

export interface About {
  name: string;
  role: string;
  bio: string[];
  links: { label: string; href: string }[];
}

export const ABOUT: About = {
  name: 'Shubh Jani',
  role: 'Founder, Engineer',
  bio: [
    'I started Fermion to do what big shops promise but rarely deliver — pair a senior engineer directly with a founder, then ship fast.',
    'Before this, I led engineering at Fero.AI working on production ML systems and full-stack platforms across commerce, fintech, and SaaS. Most projects shipped end-to-end in 6 — 8 weeks. The shape of the engagement matters more than the size of the team.'
  ],
  links: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/shubh-jani/' },
    { label: 'GitHub', href: 'https://github.com/ShubhJ1999' },
    { label: 'Email', href: 'mailto:support@fermionsoftwaresolutions.com' }
  ]
};
