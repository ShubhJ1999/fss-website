// Trust stat row + testimonial pull. Hides itself entirely while STATS and
// TESTIMONIALS are placeholders. Edit STATS below + TESTIMONIALS to surface it.

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
  const hasRealStat = STATS.some((s) => s.value !== '—' && !/placeholder/i.test(s.label));
  const hasTestimonial = TESTIMONIALS.length > 0;
  if (!hasRealStat && !hasTestimonial) {
    root.remove();
    return;
  }

  if (hasRealStat) {
    const stats = el('div', { class: 'trust-stats' });
    for (const s of STATS) {
      const cell = el('div', {});
      cell.appendChild(el('strong', { text: s.value }));
      cell.appendChild(el('span', { text: s.label }));
      stats.appendChild(cell);
    }
    root.appendChild(stats);
  }

  const t = TESTIMONIALS[0];
  if (t) {
    const block = el('blockquote', { class: 'trust-quote' });
    block.appendChild(el('p', { text: '"' + t.quote + '"' }));
    block.appendChild(el('cite', { text: '— ' + t.author + ', ' + t.role }));
    root.appendChild(block);
  }
}
