// Tests for src/scene/motion.ts.
// Verifies OS preference detection, manual override via localStorage, and subscriber notifications.

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('motion mode', () => {
  let getMotionMode: typeof import('../src/scene/motion').getMotionMode;
  let setMotionMode: typeof import('../src/scene/motion').setMotionMode;
  let onMotionChange: typeof import('../src/scene/motion').onMotionChange;

  beforeEach(async () => {
    localStorage.clear();
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: false, media: q,
      addEventListener: () => {}, removeEventListener: () => {}
    }));
    vi.resetModules();
    const m = await import('../src/scene/motion');
    getMotionMode = m.getMotionMode;
    setMotionMode = m.setMotionMode;
    onMotionChange = m.onMotionChange;
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

  it('does not notify listeners when mode unchanged', () => {
    const cb = vi.fn();
    onMotionChange(cb);
    setMotionMode('reduced');
    setMotionMode('reduced');
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('survives localStorage throwing on getItem', () => {
    const orig = Storage.prototype.getItem;
    Storage.prototype.getItem = () => { throw new Error('blocked'); };
    expect(() => getMotionMode()).not.toThrow();
    expect(getMotionMode()).toBe('full');
    Storage.prototype.getItem = orig;
  });

  it('survives localStorage throwing on setItem (in-memory still updates)', () => {
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = () => { throw new Error('blocked'); };
    setMotionMode('reduced');
    expect(getMotionMode()).toBe('reduced');
    Storage.prototype.setItem = orig;
  });
});
