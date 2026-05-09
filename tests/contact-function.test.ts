// Tests for functions/api/contact.ts validatePayload.
// Pure validation logic — no Worker runtime, no Resend.

import { describe, it, expect } from 'vitest';
import { validatePayload } from '../functions/_lib/validate';

describe('contact function validation', () => {
  it('rejects missing fields', () => {
    expect(validatePayload({ name: '', email: '', project: '' }).ok).toBe(false);
  });
  it('rejects bad email', () => {
    expect(validatePayload({ name: 'A', email: 'nope', project: 'hi there' }).ok).toBe(false);
  });
  it('accepts a good payload', () => {
    expect(validatePayload({ name: 'A', email: 'a@b.co', project: 'build me a thing' }).ok).toBe(true);
  });
});
