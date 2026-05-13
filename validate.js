// Contact-form payload validation. Shared by server.js and the vitest suite.
// No runtime dependencies — runs in Node and in happy-dom.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validatePayload(p) {
  if (!p?.name || !p.name.trim()) return { ok: false, reason: 'name' };
  if (!p?.email || !EMAIL_RE.test(p.email)) return { ok: false, reason: 'email' };
  if (!p?.project || p.project.trim().length < 5) return { ok: false, reason: 'project' };
  return { ok: true };
}
