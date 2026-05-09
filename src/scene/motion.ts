// Reduced-motion mode: OS prefs + manual override (localStorage).
// Subscribed to by timeline.ts to choose scrub-vs-static rendering.

export type MotionMode = 'full' | 'reduced';

const STORAGE_KEY = 'fss:motion-mode';
const listeners = new Set<(mode: MotionMode) => void>();
let cached: MotionMode | null = null;

function readManual(): MotionMode | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'full' || v === 'reduced' ? v : null;
  } catch {
    return null;
  }
}

function readOs(): MotionMode {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduced' : 'full';
}

export function getMotionMode(): MotionMode {
  if (cached) return cached;
  const manual = readManual();
  return manual ?? readOs();
}

export function setMotionMode(mode: MotionMode): void {
  if (getMotionMode() === mode) return;
  cached = mode;
  try { localStorage.setItem(STORAGE_KEY, mode); } catch { /* in-memory only */ }
  listeners.forEach((l) => l(mode));
}

export function onMotionChange(cb: (mode: MotionMode) => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
