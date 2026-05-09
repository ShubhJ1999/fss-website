// Reduced-motion mode: OS prefs + manual override (localStorage).
// Subscribed to by timeline.ts to choose scrub-vs-static rendering.

export type MotionMode = 'full' | 'reduced';

const STORAGE_KEY = 'fss:motion-mode';
const listeners = new Set<(mode: MotionMode) => void>();

export function getMotionMode(): MotionMode {
  const manual = localStorage.getItem(STORAGE_KEY) as MotionMode | null;
  if (manual === 'full' || manual === 'reduced') return manual;
  const os = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return os ? 'reduced' : 'full';
}

export function setMotionMode(mode: MotionMode): void {
  localStorage.setItem(STORAGE_KEY, mode);
  listeners.forEach((l) => l(mode));
}

export function onMotionChange(cb: (mode: MotionMode) => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
