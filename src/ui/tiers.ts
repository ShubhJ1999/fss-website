// Engagement tiers grid. Three cards (Sprint / Build / Embed) with CTAs to the
// contact section. Featured tier (Build) gets a highlighted border.

import { TIERS } from '../content/tiers';
import { el, tree } from '../lib/dom';

export function mountTiers(root: HTMLElement): void {
  for (const t of TIERS) {
    const card = el('div', { class: 'tier-card' + (t.featured ? ' featured' : '') });
    card.appendChild(el('h3', { text: t.name }));
    card.appendChild(el('p', { class: 'pitch', text: t.pitch }));
    card.appendChild(el('p', { class: 'duration', text: t.duration }));
    card.appendChild(el('p', { class: 'pricing', text: t.pricing }));
    card.appendChild(tree('ul', {}, t.fit.map((x) => el('li', { text: x }))));
    card.appendChild(el('a', { class: 'cta', text: t.cta.label, attrs: { href: t.cta.href } }));
    root.appendChild(card);
  }
}
