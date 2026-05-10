// About section — renders all founders side-by-side. Bios show only when populated.

import { FOUNDERS } from '../content/about';
import { el } from '../lib/dom';

export function mountAbout(root: HTMLElement): void {
  for (const f of FOUNDERS) {
    const card = el('div', { class: 'founder-card' });
    card.appendChild(el('span', { class: 'kicker', text: f.role }));
    card.appendChild(el('h3', { text: f.name }));
    for (const para of f.bio) card.appendChild(el('p', { text: para }));

    if (f.links.length > 0) {
      const links = el('div', { class: 'about-links' });
      for (const l of f.links) {
        links.appendChild(el('a', {
          class: 'about-link',
          text: l.label,
          attrs: { href: l.href, rel: 'noopener noreferrer' }
        }));
      }
      card.appendChild(links);
    }

    root.appendChild(card);
  }
}
