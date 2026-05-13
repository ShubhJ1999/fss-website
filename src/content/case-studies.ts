// Case studies — three featured projects from the Fermion portfolio.
// Names, slugs, and taglines reflect real projects. Problem/approach/result
// bodies are placeholders until Shubh + Dhruv add the full write-ups.

export interface CaseStudy {
  slug: string;
  client: string;
  tagline: string;
  cover: string;
  problem: string;
  approach: string[];
  result: { metric: string; value: string }[];
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'ca-dms',
    client: 'CA-DMS',
    tagline: 'Document management for chartered accountants.',
    cover: '/cases/ca-dms-cover.png',
    problem: 'PLACEHOLDER — confirm before launch.',
    approach: [],
    result: []
  },
  {
    slug: 'docgpt',
    client: 'DocGPT',
    tagline: 'AI document intelligence for fast retrieval and answers.',
    cover: '/cases/docgpt-cover.png',
    problem: 'PLACEHOLDER — confirm before launch.',
    approach: [],
    result: []
  },
  {
    slug: 'apneedukan',
    client: 'Apne Dukan',
    tagline: 'E-commerce SaaS for independent retailers.',
    cover: '/cases/apneedukan-cover.png',
    problem: 'PLACEHOLDER — confirm before launch.',
    approach: [],
    result: []
  }
];
