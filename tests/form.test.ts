// Tests for src/ui/form.ts validateFields.
// Pure validation logic — no DOM, no fetch.

import { describe, it, expect } from 'vitest';
import { validateFields } from '../src/ui/form';

describe('validateFields', () => {
  it('rejects empty name', () => {
    const r = validateFields({ name: '', email: 'a@b.co', project: 'build me a thing' });
    expect(r.valid).toBe(false);
    expect(r.errors.name).toBeTruthy();
  });
  it('rejects bad email', () => {
    const r = validateFields({ name: 'A', email: 'not-an-email', project: 'build me a thing' });
    expect(r.valid).toBe(false);
    expect(r.errors.email).toBeTruthy();
  });
  it('rejects too-short project', () => {
    const r = validateFields({ name: 'A', email: 'a@b.co', project: 'hi' });
    expect(r.valid).toBe(false);
    expect(r.errors.project).toBeTruthy();
  });
  it('accepts a fully filled form', () => {
    const r = validateFields({ name: 'A', email: 'a@b.co', project: 'Build me a thing.' });
    expect(r.valid).toBe(true);
    expect(Object.keys(r.errors).length).toBe(0);
  });
});
