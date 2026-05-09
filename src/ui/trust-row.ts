// Trust stat row + one testimonial pull. No client logos in v1 per spec decision.
// Stats render as a 4-cell strip; quote follows below in the same container.

import { TESTIMONIALS } from '../content/testimonials';
import { el } from '../lib/dom';

interface Stat { value: string; label: string; }
const STATS: Stat[] = [
  { value: '30+', label: 'Deliveries' },
  { value: '4',   label: 'Countries' },
  { value: '0',   label: 'Vendor lock-in' },
  { value: '~95%', label: 'Repeat / referral' }
];

export function mountTrustRow(root: HTMLElement): void {
  const stats = el('div', { class: 'trust-stats' });
  for (const s of STATS) {
    const cell = el('div', {});
    cell.appendChild(el('strong', { text: s.value }));
    cell.appendChild(el('span', { text: s.label }));
    stats.appendChild(cell);
  }
  root.appendChild(stats);

  const t = TESTIMONIALS[0];
  if (t) {
    const block = el('blockquote', { class: 'trust-quote' });
    block.appendChild(el('p', { text: '"' + t.quote + '"' }));
    block.appendChild(el('cite', { text: '— ' + t.author + ', ' + t.role }));
    root.appendChild(block);
  }
}
