// About section — name, role, bio, links. Text-only; no photo for now.

import { ABOUT } from '../content/about';
import { el } from '../lib/dom';

export function mountAbout(root: HTMLElement): void {
  const body = el('div', { class: 'about-body' });
  body.appendChild(el('span', { class: 'kicker', text: ABOUT.role }));
  body.appendChild(el('h3', { text: ABOUT.name }));
  for (const para of ABOUT.bio) body.appendChild(el('p', { text: para }));

  const links = el('div', { class: 'about-links' });
  for (const l of ABOUT.links) {
    links.appendChild(el('a', {
      class: 'about-link',
      text: l.label,
      attrs: { href: l.href, rel: 'noopener noreferrer' }
    }));
  }
  body.appendChild(links);

  root.appendChild(body);
}
