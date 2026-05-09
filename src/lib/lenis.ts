// Lenis smooth-scroll integration. Drives GSAP's RAF so ScrollTrigger stays in sync.
// Disabled when motion mode = reduced.

import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getMotionMode } from '../scene/motion';

export interface LenisHandle { destroy: () => void; }

export function initLenis(): LenisHandle | null {
  if (getMotionMode() === 'reduced') return null;

  const lenis = new Lenis({ duration: 1.2, smoothWheel: true, syncTouch: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return { destroy: () => lenis.destroy() };
}
