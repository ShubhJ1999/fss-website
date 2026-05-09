// Tests for src/scene/motion.ts.
// Verifies OS preference detection, manual override via localStorage, and subscriber notifications.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getMotionMode, setMotionMode, onMotionChange } from '../src/scene/motion';

describe('motion mode', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: false, media: q,
      addEventListener: () => {}, removeEventListener: () => {}
    }));
  });

  it('defaults to full when no OS preference and no localStorage', () => {
    expect(getMotionMode()).toBe('full');
  });

  it('respects prefers-reduced-motion', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('reduce'), media: q,
      addEventListener: () => {}, removeEventListener: () => {}
    }));
    expect(getMotionMode()).toBe('reduced');
  });

  it('lets manual override beat OS preference', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('reduce'), media: q,
      addEventListener: () => {}, removeEventListener: () => {}
    }));
    setMotionMode('full');
    expect(getMotionMode()).toBe('full');
  });

  it('notifies subscribers on setMotionMode', () => {
    const cb = vi.fn();
    onMotionChange(cb);
    setMotionMode('reduced');
    expect(cb).toHaveBeenCalledWith('reduced');
  });
});
