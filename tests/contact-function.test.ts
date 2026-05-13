// Tests for the contact-form payload validation used by server.js.
// Pure logic — no HTTP, no Resend.

import { describe, it, expect } from 'vitest';
// @ts-expect-error — plain JS, no .d.ts shipped
import { validatePayload } from '../validate.js';

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
