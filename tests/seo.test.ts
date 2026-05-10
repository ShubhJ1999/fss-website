// Tests for src/lib/seo.ts JSON-LD generators.

import { describe, it, expect } from 'vitest';
import { organizationJsonLd, serviceJsonLd } from '../src/lib/seo';

describe('seo helpers', () => {
  it('Organization JSON-LD has required fields', () => {
    const json = organizationJsonLd();
    expect(json['@type']).toBe('Organization');
    expect(json.name).toBe('Fermion Software Solutions');
    expect(json.url).toMatch(/^https:\/\//);
  });
  it('Service JSON-LD links back to Organization', () => {
    const json = serviceJsonLd('Custom Software', 'Bespoke web and back-end systems.');
    expect(json['@type']).toBe('Service');
    expect(json.provider['@type']).toBe('Organization');
  });
});
