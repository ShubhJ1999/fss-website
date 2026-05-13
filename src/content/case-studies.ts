// Case studies — three featured projects from the Fermion portfolio.
// Problem / approach / result bodies are first drafts; edit in-place rather than
// regenerating, so the on-page copy keeps a consistent voice.

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
    problem:
      "Chartered accountancy practices in India handle thousands of client documents every quarter — GST returns, audit files, ledger exports — across hundreds of clients. Most run on WhatsApp threads, email attachments, and physical folders. Finding last year's signed audit report takes an associate an hour. Compliance deadlines slip when the trail breaks.",
    approach: [
      'Client-centric document model. Every file lives under client → engagement → type, with version history and signed-state tracking baked in.',
      'Tag-based search across full text plus metadata. An associate can find "form 3CA, client X, FY 2024-25" in two clicks.',
      'Role-based access. Partners see everything; associates only their assigned clients; clients only their own portal.',
      'Audit trail by default. Every view, edit, and download is logged for compliance review.',
      'Email and WhatsApp ingestion. Forward an attachment to the firm address and it files itself under the right client automatically.'
    ],
    result: [
      { value: '70%', metric: 'faster document retrieval' },
      { value: '5k+', metric: 'documents indexed per practice' },
      { value: '0', metric: 'compliance audits missed since launch' }
    ]
  },
  {
    slug: 'docgpt',
    client: 'DocGPT',
    tagline: 'AI document intelligence for fast retrieval and answers.',
    cover: '/cases/docgpt-cover.png',
    problem:
      "Operations teams at mid-sized SaaS companies burn 5–8 hours a week answering 'where is that thing in the contract' questions. Documents live in Notion, in PDFs across Drive, in Slack threads, in legal email. The answers exist; only people who've been there a year know where to look. New hires spend their first three months figuring out the filing system instead of doing the job.",
    approach: [
      'Single retrieval index across contracts, SOPs, internal wikis, and Slack archives. No manual tagging required.',
      'Hybrid retrieval (BM25 plus vector embeddings) so answers do not drift when phrasing varies.',
      'Grounded answers only. Every response cites a source paragraph; if no source exists, the system says so instead of inventing one.',
      'Role-aware queries. A sales rep cannot pull an HR document they would not already have access to in the source system.',
      'Slack-native interface. Most questions are a /ask slash command, so the tool lives where teams already work.'
    ],
    result: [
      { value: '82%', metric: 'answer accuracy on internal eval' },
      { value: '<2s', metric: 'median response latency' },
      { value: '6 hrs', metric: 'reclaimed per ops hire per week' }
    ]
  },
  {
    slug: 'apneedukan',
    client: 'Apne Dukan',
    tagline: 'E-commerce SaaS for independent retailers.',
    cover: '/cases/apneedukan-cover.png',
    problem:
      "Small independent retailers in tier-2 and tier-3 Indian cities want an online storefront. Shopify is priced in dollars and most cannot justify it; custom sites need engineers they cannot hire. So they run their business on WhatsApp catalogs and Instagram DMs — which breaks the moment they cross a few dozen orders a day. Most are still cash-on-delivery because integrating Razorpay alone is more work than they can take on.",
    approach: [
      'Multi-tenant SaaS with a 10-minute onboarding flow. Pick a name, add products, paste a UPI ID, the storefront is live.',
      'Hindi-first interface. Every screen, error message, and transactional email translated by humans, not Google.',
      'WhatsApp checkout. Customers complete a purchase inside a WhatsApp Business thread, no app install needed.',
      'Payments wired end-to-end. UPI, Razorpay, and cash-on-delivery, with automatic GST invoice generation.',
      'Mobile-first dashboard. The shop owner runs inventory and orders from a phone, since that is all they have on them.'
    ],
    result: [
      { value: '10 min', metric: 'signup to first sale' },
      { value: '₹800', metric: 'monthly price, all-in' },
      { value: '100+', metric: 'stores onboarded in pilot' }
    ]
  }
];
