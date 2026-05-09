// Tests for src/lib/dom.ts — verifies safe construction (text via textContent,
// no HTML parsing), attribute setting, and nested tree composition.
import { describe, it, expect } from 'vitest';
import { el, tree } from '../src/lib/dom';

describe('el', () => {
  it('creates element with text + class', () => {
    const e = el('p', { class: 'foo', text: 'hi' });
    expect(e.tagName).toBe('P');
    expect(e.className).toBe('foo');
    expect(e.textContent).toBe('hi');
  });

  it('escapes injected text — never parses HTML', () => {
    const e = el('span', { text: '<script>alert(1)</script>' });
    expect(e.textContent).toBe('<script>alert(1)</script>');
    expect(e.querySelector('script')).toBe(null);
  });

  it('sets attributes', () => {
    const e = el('a', { attrs: { href: '/x', 'data-id': '7' } });
    expect(e.getAttribute('href')).toBe('/x');
    expect(e.dataset.id).toBe('7');
  });
});

describe('tree', () => {
  it('builds nested structures', () => {
    const root = tree('div', { class: 'wrap' }, [
      el('h2', { text: 'title' }),
      tree('ul', {}, [el('li', { text: 'one' }), el('li', { text: 'two' })])
    ]);
    expect(root.querySelector('h2')?.textContent).toBe('title');
    expect(root.querySelectorAll('li').length).toBe(2);
  });
});
