// Pure validation for the contact form payload. Shared by the function and tests.
// No runtime dependencies — works in both Worker and Node test environments.

export interface Payload { name: string; email: string; project: string; budget?: string; }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validatePayload(p: Partial<Payload>): { ok: boolean; reason?: string } {
  if (!p.name || !p.name.trim()) return { ok: false, reason: 'name' };
  if (!p.email || !EMAIL_RE.test(p.email)) return { ok: false, reason: 'email' };
  if (!p.project || p.project.trim().length < 5) return { ok: false, reason: 'project' };
  return { ok: true };
}
