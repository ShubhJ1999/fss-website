// Trust stat row + testimonial pull. Stats and quote are placeholders;
// Shubh + Dhruv fill in real numbers and a real client quote before launch.

import { TESTIMONIALS } from '../content/testimonials';
import { el } from '../lib/dom';

interface Stat { value: string; label: string; }
const STATS: Stat[] = [
  { value: '—', label: 'Placeholder' },
  { value: '—', label: 'Placeholder' },
  { value: '—', label: 'Placeholder' },
  { value: '—', label: 'Placeholder' }
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
