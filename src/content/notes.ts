// Note cards for the homepage "Notes" section. Stubs in v1 — real /notes/<slug>
// pages land in v1.1. Showing 3 cards is enough to signal ongoing thinking.

export interface Note {
  slug: string;
  title: string;
  blurb: string;
  date: string;
  readingMinutes: number;
}

export const NOTES: Note[] = [
  {
    slug: 'shipping-medusa-v2-in-anger',
    title: 'Shipping Medusa v2 in anger',
    blurb: 'What we learned building 11 custom modules on top of Medusa for SwedTeknik — and where the framework still gets in the way.',
    date: '2026-04',
    readingMinutes: 8
  },
  {
    slug: 'ml-pipelines-without-airflow',
    title: 'ML pipelines without Airflow',
    blurb: 'A small-team pattern for production ML that doesn\'t need a DAG orchestrator. Cron + idempotent jobs goes a long way.',
    date: '2026-03',
    readingMinutes: 6
  },
  {
    slug: 'cloudflare-workers-replaced-our-backend',
    title: 'Cloudflare Workers replaced our backend',
    blurb: 'How we cut hosting costs 80% and TTFB to under 50ms by moving a Node monolith to Workers + Durable Objects.',
    date: '2026-02',
    readingMinutes: 7
  }
];
