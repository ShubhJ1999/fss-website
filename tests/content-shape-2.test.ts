// Validates the shape of case studies, testimonials, and tier content modules.
// Guards against missing required fields before they reach a render path.

import { describe, it, expect } from 'vitest';
import { CASE_STUDIES } from '../src/content/case-studies';
import { TESTIMONIALS } from '../src/content/testimonials';
import { TIERS } from '../src/content/tiers';

describe('content shape', () => {
  it('case studies: 3, structural fields present (content may be placeholder)', () => {
    expect(CASE_STUDIES.length).toBe(3);
    for (const c of CASE_STUDIES) {
      expect(c.slug).toMatch(/^[a-z0-9-]+$/);
      expect(c.client).toBeTruthy();
      expect(c.tagline).toBeTruthy();
      expect(c.problem).toBeTruthy();
      expect(Array.isArray(c.approach)).toBe(true);
      expect(Array.isArray(c.result)).toBe(true);
    }
  });
  it('testimonials have a quote and attribution', () => {
    for (const t of TESTIMONIALS) {
      expect(t.quote).toBeTruthy();
      expect(t.author).toBeTruthy();
    }
  });
  it('tiers: 3, each with a CTA', () => {
    expect(TIERS.length).toBe(3);
    for (const tr of TIERS) {
      expect(tr.name).toBeTruthy();
      expect(tr.cta).toBeTruthy();
    }
  });
});
