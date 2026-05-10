// About section — photo + bio + links. Single entry sourced from src/content/about.ts.

import { ABOUT } from '../content/about';
import { el } from '../lib/dom';

export function mountAbout(root: HTMLElement): void {
  const photo = el('div', { class: 'about-photo' });
  const img = el('img', {
    attrs: {
      src: ABOUT.photo,
      alt: `${ABOUT.name}, ${ABOUT.role}`,
      loading: 'lazy',
      width: '320',
      height: '320'
    }
  });
  photo.appendChild(img);

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

  root.appendChild(photo);
  root.appendChild(body);
}
