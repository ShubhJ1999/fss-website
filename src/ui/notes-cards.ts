// Notes section — 3 article cards. Cards link to /notes/<slug>; real pages land in v1.1.

import { NOTES } from '../content/notes';
import { el } from '../lib/dom';
import { track } from '../lib/analytics';

export function mountNotesCards(root: HTMLElement): void {
  for (const n of NOTES) {
    const a = el('a', {
      class: 'note-card',
      attrs: { href: `/notes/${n.slug}` },
      on: { click: () => track('note_open', { slug: n.slug }) }
    });
    a.appendChild(el('span', { class: 'note-meta', text: `${n.date} · ${n.readingMinutes} min read` }));
    a.appendChild(el('h3', { text: n.title }));
    a.appendChild(el('p', { text: n.blurb }));
    a.appendChild(el('span', { class: 'more', text: 'Read →' }));
    root.appendChild(a);
  }
}
