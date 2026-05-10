// Case study card grid for the index. Links to standalone case pages.

import { CASE_STUDIES } from '../content/case-studies';
import { el } from '../lib/dom';
import { track } from '../lib/analytics';

export function mountCaseCards(root: HTMLElement): void {
  for (const c of CASE_STUDIES) {
    const a = el('a', {
      class: 'case-card',
      attrs: { href: `./pages/${c.slug}.html` },
      on: { click: () => track('case_study_open', { slug: c.slug }) }
    });
    a.appendChild(el('span', { class: 'kicker', text: c.client }));
    a.appendChild(el('h3', { text: c.tagline }));

    const results = el('div', { class: 'results' });
    for (const r of c.result.slice(0, 2)) {
      const span = el('span', {});
      span.appendChild(el('strong', { text: r.value }));
      span.appendChild(document.createTextNode(' ' + r.metric));
      results.appendChild(span);
    }
    a.appendChild(results);
    a.appendChild(el('span', { class: 'more', text: 'Read the case →' }));
    root.appendChild(a);
  }
}
