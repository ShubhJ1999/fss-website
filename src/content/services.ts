// Service catalogue: name + cluster (used by 3D constellation) and detail content.
// Single source of truth — no duplicate inline arrays anywhere else.

export type ServiceCluster = 'Build' | 'Run' | 'Grow';

export interface Service {
  slug: string;
  name: string;
  cluster: ServiceCluster;
  blurb: string;
  body: string[];
  stack: string[];
  timeline: string;
  sample?: { name: string; href: string };
}

export const SERVICES: Service[] = [
  { slug: 'custom-software', name: 'Custom Software', cluster: 'Build',
    blurb: 'Bespoke web and back-end systems built around your operations.',
    body: [
      'When the off-the-shelf tools end, we step in. Internal dashboards, customer portals, integrations between SaaS systems that don\'t talk to each other, custom logic on top of Stripe / HubSpot / Notion.',
      'Tech is decided by the problem, not by what we already know. Typical stack: TypeScript end-to-end, Postgres, edge-deployed APIs.'
    ],
    stack: ['TypeScript', 'Next.js', 'Postgres', 'Cloudflare Workers'],
    timeline: '4 — 8 weeks' },
  { slug: 'ui-ux-design', name: 'UI / UX Design', cluster: 'Build',
    blurb: 'Product design that ships, by engineers who design.',
    body: ['Product flows, interface design, prototyping. Output is Figma plus a clear spec, not a brand book.',
           'We design with the build in mind — no design-something-then-can\'t-implement theatre.'],
    stack: ['Figma', 'Tailwind tokens', 'Framer'],
    timeline: '1 — 3 weeks' },
  { slug: 'cms-development', name: 'CMS Development', cluster: 'Build',
    blurb: 'Headless CMS setups your team can actually edit.',
    body: ['Sanity, Payload, Strapi, or hand-rolled when warranted. Schemas designed around the content team\'s real workflow.',
           'Includes editor onboarding and a doc you can hand a junior PM.'],
    stack: ['Sanity', 'Payload', 'Strapi'],
    timeline: '2 — 4 weeks' },
  { slug: 'blockchain', name: 'Blockchain Solutions', cluster: 'Build',
    blurb: 'Smart contracts and on-chain integrations when the use case is real.',
    body: ['We don\'t do blockchain-for-the-sake-of. Payments, traceability, NFT-as-receipt, L2 integration when the alternative truly is worse.'],
    stack: ['Solidity', 'Hardhat', 'Viem', 'Optimism / Base'],
    timeline: '4 — 10 weeks' },
  { slug: 'machine-learning', name: 'Machine Learning', cluster: 'Build',
    blurb: 'Production ML — pipelines, fine-tunes, retrieval, evaluation.',
    body: ['From RAG over your own corpus to fine-tuned classifiers running on a Pi. We focus on shipping models that pay for themselves.'],
    stack: ['Python', 'PyTorch', 'Anthropic / OpenAI APIs', 'Vector DBs'],
    timeline: '3 — 8 weeks' },
  { slug: 'api-testing', name: 'API Testing', cluster: 'Run',
    blurb: 'Contract, load, and chaos testing for systems you can\'t afford to ship broken.',
    body: ['Postman / Newman, k6, Pact, hand-rolled. Test plan into CI so it stays honest.'],
    stack: ['k6', 'Pact', 'Postman / Newman', 'GitHub Actions'],
    timeline: '1 — 2 weeks' },
  { slug: 'cloud-hosting', name: 'Cloud Hosting', cluster: 'Run',
    blurb: 'Hosting that doesn\'t become a side-project of its own.',
    body: ['Cloudflare Pages, Fly.io, Render, AWS when the constraint is real. Includes monitoring and a runbook.'],
    stack: ['Cloudflare', 'Fly.io', 'Terraform'],
    timeline: 'Ongoing' },
  { slug: 'cloud-solutions', name: 'Cloud Solutions', cluster: 'Run',
    blurb: 'AWS / GCP / Azure architecture, IaC, migrations.',
    body: ['Greenfield architectures, lift-and-shift migrations, FinOps cleanups when the bill becomes the problem.'],
    stack: ['AWS', 'Terraform', 'Pulumi'],
    timeline: '2 — 6 weeks' },
  { slug: 'serverless', name: 'Serverless', cluster: 'Run',
    blurb: 'Edge functions, Lambdas, queues — without the operational tax.',
    body: ['Workers, Lambdas, Durable Objects. Built for cold-start, observability, and cost discipline from day one.'],
    stack: ['Cloudflare Workers', 'AWS Lambda', 'Durable Objects'],
    timeline: '1 — 3 weeks' },
  { slug: 'remote-hosting', name: 'Remote Hosting', cluster: 'Run',
    blurb: 'Self-hosted apps on infra you own.',
    body: ['Coolify, Dokku, Caprover, or plain docker-compose on a VPS — when SOC compliance or cost demands it.'],
    stack: ['Coolify', 'Hetzner', 'Tailscale'],
    timeline: '1 — 2 weeks' },
  { slug: 'remote-infrastructure', name: 'Remote Infrastructure', cluster: 'Run',
    blurb: 'Networking, VPN, observability for distributed teams.',
    body: ['Tailscale meshes, secret management, log/metric pipelines. The plumbing nobody wants to own.'],
    stack: ['Tailscale', 'Grafana', 'Loki', 'Vault'],
    timeline: '1 — 3 weeks' },
  { slug: 'rpa', name: 'Robotic Process Automation', cluster: 'Grow',
    blurb: 'Automate the manual workflows that drain ops teams.',
    body: ['Playwright + scheduled jobs, Zapier when right-sized, custom orchestration when not. Each automation comes with a rollback story.'],
    stack: ['Playwright', 'n8n', 'Temporal'],
    timeline: '1 — 4 weeks' },
  { slug: 'marketing', name: 'Marketing', cluster: 'Grow',
    blurb: 'Lead-gen pipelines, attribution plumbing, content infra.',
    body: ['CRM hookups, attribution from ad → close, performance content sites, email automations that don\'t feel like spam.'],
    stack: ['HubSpot', 'Resend', 'Plausible', 'Webflow / custom'],
    timeline: '2 — 6 weeks' },
  { slug: 'corporate-training', name: 'Corporate Training', cluster: 'Grow',
    blurb: 'Hands-on workshops on the stack we build with.',
    body: ['TypeScript fundamentals, ML for engineers, cloud architecture practicums. Run remote or on-site.'],
    stack: ['Live coding', 'Workshop curricula'],
    timeline: '2 — 5 days' }
];
