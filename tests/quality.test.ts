// Tests for src/scene/quality.ts.
// Pass values directly to detectQuality() — no global stubbing needed.

import { describe, it, expect } from 'vitest';
import { detectQuality } from '../src/scene/quality';

describe('detectQuality', () => {
  it('returns mobile tier when isMobile is true', () => {
    const q = detectQuality(true, 8);
    expect(q.tier).toBe('mobile');
    expect(q.bloomEnabled).toBe(false);
    expect(q.dprCap).toBeLessThanOrEqual(1.5);
    expect(q.particleCount).toBe(400);
  });

  it('returns low tier when cores < 4 on desktop', () => {
    const q = detectQuality(false, 2);
    expect(q.tier).toBe('low');
    expect(q.bloomEnabled).toBe(true);
    expect(q.dofEnabled).toBe(false);
  });

  it('returns mid tier when cores in 4-7 on desktop', () => {
    const q = detectQuality(false, 6);
    expect(q.tier).toBe('mid');
    expect(q.bloomEnabled).toBe(true);
    expect(q.dofEnabled).toBe(true);
    expect(q.chromaticEnabled).toBe(false);
    expect(q.particleCount).toBe(1200);
  });

  it('returns high tier on a capable desktop', () => {
    const q = detectQuality(false, 8);
    expect(q.tier).toBe('high');
    expect(q.bloomEnabled).toBe(true);
    expect(q.dofEnabled).toBe(true);
    expect(q.chromaticEnabled).toBe(true);
    expect(q.particleCount).toBeGreaterThanOrEqual(1000);
  });
});
