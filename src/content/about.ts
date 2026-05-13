// Founders behind Fermion. Bios pulled from public LinkedIn profiles —
// edit in-place rather than mocking out for fresh copy.

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
    bio: [
      'Lead software engineer based in Dubai. I build scalable backend systems for production-grade software.',
      'Computer Science, Gujarat Technological University. Working principle: keep it simple — fewer moving parts, clearer ownership, faster iteration.'
    ],
    links: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/shubhjani/' },
      { label: 'GitHub', href: 'https://github.com/ShubhJ1999' }
    ]
  },
  {
    name: 'Dhruv Patel',
    role: 'Founder, Engineer',
    bio: [
      'Senior software engineer based in Ahmedabad. I build scalable backend and cloud infrastructure with FastAPI and Python.',
      'Focus areas: distributed systems, AI and data platforms, high-performance backend services. Currently at EPAM Systems.'
    ],
    links: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/the-dkpatel/' },
      { label: 'Site', href: 'https://thedkpatel.com' }
    ]
  }
];
