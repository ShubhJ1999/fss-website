// Founders behind Fermion. Bio copy left as placeholders for now —
// Dhruv is providing the real text.

export interface Founder {
  name: string;
  role: string;
  bio: string[];
  links: { label: string; href: string }[];
}

export const FOUNDERS: Founder[] = [
  {
    name: 'Shubh Jani',
    role: 'Founder, Engineer',
    bio: [],
    links: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/shubh-jani/' },
      { label: 'GitHub', href: 'https://github.com/ShubhJ1999' }
    ]
  },
  {
    name: 'Dhruv Patel',
    role: 'Founder',
    bio: [],
    links: []
  }
];
