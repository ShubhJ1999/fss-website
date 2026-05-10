// Case studies. All placeholder content for now — Shubh + Dhruv fill in
// real client names, taglines, problems, approaches, and result metrics.

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
    slug: 'case-one',
    client: 'PLACEHOLDER',
    tagline: 'PLACEHOLDER tagline — confirm before launch.',
    cover: '/cases/case-one-cover.png',
    problem: 'PLACEHOLDER — confirm before launch.',
    approach: [],
    result: []
  },
  {
    slug: 'case-two',
    client: 'PLACEHOLDER',
    tagline: 'PLACEHOLDER tagline — confirm before launch.',
    cover: '/cases/case-two-cover.png',
    problem: 'PLACEHOLDER — confirm before launch.',
    approach: [],
    result: []
  },
  {
    slug: 'case-three',
    client: 'PLACEHOLDER',
    tagline: 'PLACEHOLDER tagline — confirm before launch.',
    cover: '/cases/case-three-cover.png',
    problem: 'PLACEHOLDER — confirm before launch.',
    approach: [],
    result: []
  }
];
