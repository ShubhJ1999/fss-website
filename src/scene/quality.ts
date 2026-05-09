// Device tier detection + per-tier render quality config.
// Selected once at boot; renderer + objects branch on this struct.

export type Tier = 'mobile' | 'low' | 'mid' | 'high';

export interface Quality {
  tier: Tier;
  dprCap: number;
  particleCount: number;
  bloomEnabled: boolean;
  dofEnabled: boolean;
  chromaticEnabled: boolean;
}

export function detectQuality(): Quality {
  const isMobile = window.matchMedia('(max-width: 720px)').matches;
  const cores = navigator.hardwareConcurrency ?? 4;

  if (isMobile) {
    return { tier: 'mobile', dprCap: 1.5, particleCount: 400,
             bloomEnabled: false, dofEnabled: false, chromaticEnabled: false };
  }
  if (cores < 4) {
    return { tier: 'low', dprCap: 1.5, particleCount: 700,
             bloomEnabled: true, dofEnabled: false, chromaticEnabled: false };
  }
  if (cores < 8) {
    return { tier: 'mid', dprCap: 2, particleCount: 1200,
             bloomEnabled: true, dofEnabled: true, chromaticEnabled: false };
  }
  return { tier: 'high', dprCap: 2, particleCount: 1400,
           bloomEnabled: true, dofEnabled: true, chromaticEnabled: true };
}
