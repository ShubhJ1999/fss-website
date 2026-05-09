// Case studies displayed on the index and rendered as standalone pages.
// SwedTeknik content is real; case-two and case-three are placeholders Shubh
// confirms before launch.

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
    slug: 'swedteknik',
    client: 'SwedTeknik',
    tagline: 'B2C electronics commerce, Sweden — built from scratch on Next.js 15 + Medusa v2.',
    cover: '/cases/swedteknik-cover.png',
    problem: 'A two-founder team needed an e-commerce platform sized for a Swedish-language tech / electronics market — strong product detail, multi-language admin, loyalty + RPA hooks the team could operate without a vendor on retainer. Shopify wasn\'t flexible enough; raw Medusa was too raw.',
    approach: [
      'Next.js 15 storefront with App Router, Medusa v2 backend with 11 custom modules.',
      'Stripe payments, Meilisearch product index, multi-language admin, loyalty program, full admin dashboard.',
      'Shipped MVP in stages — storefront → checkout → admin → loyalty — so the team could start using internal tools early.'
    ],
    result: [
      { metric: 'Custom backend modules', value: '11' },
      { metric: 'Documented features', value: '70+' },
      { metric: 'Vendor lock-in', value: 'zero' }
    ]
  },
  {
    slug: 'case-two',
    client: 'PLACEHOLDER',
    tagline: 'PLACEHOLDER tagline — confirm before launch.',
    cover: '/cases/case-two-cover.png',
    problem: 'PLACEHOLDER — confirm before launch.',
    approach: ['PLACEHOLDER step 1', 'PLACEHOLDER step 2'],
    result: [{ metric: 'PLACEHOLDER', value: '—' }]
  },
  {
    slug: 'case-three',
    client: 'PLACEHOLDER',
    tagline: 'PLACEHOLDER tagline — confirm before launch.',
    cover: '/cases/case-three-cover.png',
    problem: 'PLACEHOLDER — confirm before launch.',
    approach: ['PLACEHOLDER step 1', 'PLACEHOLDER step 2'],
    result: [{ metric: 'PLACEHOLDER', value: '—' }]
  }
];
