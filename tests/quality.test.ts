import { describe, it, expect, vi } from 'vitest';
import { detectQuality } from '../src/scene/quality';

describe('detectQuality', () => {
  it('returns mobile tier when viewport <= 720px', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('max-width: 720px'), media: q,
      addEventListener: () => {}, removeEventListener: () => {}
    }));
    Object.defineProperty(navigator, 'hardwareConcurrency', { value: 8, configurable: true });
    const q = detectQuality();
    expect(q.tier).toBe('mobile');
    expect(q.bloomEnabled).toBe(false);
    expect(q.dprCap).toBeLessThanOrEqual(1.5);
  });

  it('returns low tier when hardwareConcurrency < 4 on desktop', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: false, media: q,
      addEventListener: () => {}, removeEventListener: () => {}
    }));
    Object.defineProperty(navigator, 'hardwareConcurrency', { value: 2, configurable: true });
    const q = detectQuality();
    expect(q.tier).toBe('low');
    expect(q.bloomEnabled).toBe(true);
    expect(q.dofEnabled).toBe(false);
  });

  it('returns high tier on a normal desktop', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: false, media: q,
      addEventListener: () => {}, removeEventListener: () => {}
    }));
    Object.defineProperty(navigator, 'hardwareConcurrency', { value: 8, configurable: true });
    const q = detectQuality();
    expect(q.tier).toBe('high');
    expect(q.bloomEnabled).toBe(true);
    expect(q.dofEnabled).toBe(true);
    expect(q.particleCount).toBeGreaterThanOrEqual(1000);
  });
});
