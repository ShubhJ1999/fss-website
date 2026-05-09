// Tests for src/content/services.ts.
// Verifies content shape so downstream UI never breaks on missing fields.

import { describe, it, expect } from 'vitest';
import { SERVICES } from '../src/content/services';

describe('SERVICES content', () => {
  it('every service has required fields', () => {
    for (const s of SERVICES) {
      expect(s.slug).toMatch(/^[a-z0-9-]+$/);
      expect(s.name).toBeTruthy();
      expect(['Build', 'Run', 'Grow']).toContain(s.cluster);
      expect(s.blurb).toBeTruthy();
      expect(s.body.length).toBeGreaterThan(0);
      expect(s.stack.length).toBeGreaterThan(0);
      expect(s.timeline).toBeTruthy();
    }
  });
  it('slugs are unique', () => {
    const slugs = SERVICES.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
