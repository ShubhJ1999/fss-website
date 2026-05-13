// Notes — short writeups on how we ship and what we've learned. Cards render
// as static teasers on the homepage until /notes/<slug> detail pages exist.

export interface Note {
  slug: string;
  title: string;
  blurb: string;
  date: string;
  readingMinutes: number;
}

export const NOTES: Note[] = [
  {
    slug: 'keep-it-simple',
    title: 'Keep it simple, then keep it simple again.',
    blurb: 'Most production systems fail from too many moving parts, not too few. Why we cut scope twice before we write a line.',
    date: '2026',
    readingMinutes: 4
  },
  {
    slug: 'small-team-wins',
    title: 'Two senior engineers will outship a team of six.',
    blurb: 'Coordination tax is real. What changes when there are no handoffs, no tickets to triage, and the people writing the code are the people on the call.',
    date: '2026',
    readingMinutes: 5
  },
  {
    slug: 'price-by-outcome',
    title: 'Price the outcome, not the hour.',
    blurb: 'Hourly billing punishes good engineers. How we structure fixed-fee sprints and milestone builds so incentives line up with delivery.',
    date: '2026',
    readingMinutes: 4
  }
];
