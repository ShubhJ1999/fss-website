// Notes section — short teaser cards. Rendered as static blocks (no link)
// until /notes/<slug> pages exist. Hides the section if NOTES is empty.

import { NOTES } from '../content/notes';
import { el } from '../lib/dom';

export function mountNotesCards(root: HTMLElement): void {
  if (NOTES.length === 0) {
    root.closest('section')?.remove();
    return;
  }
  for (const n of NOTES) {
    const card = el('div', { class: 'note-card note-card-static' });
    card.appendChild(el('h3', { text: n.title }));
    card.appendChild(el('p', { text: n.blurb }));
    root.appendChild(card);
  }
}
