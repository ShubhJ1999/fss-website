// Sticky "Book a call" button, bottom-right on desktop. Hidden on mobile by CSS.
// Reuses Cal.com via the data-cal-link attribute (booking.ts's attachCalLinks picks it up).

import { el } from '../lib/dom';

export function mountFloatingCta(slug: string): void {
  const btn = el('button', {
    class: 'floating-cta',
    text: 'Book a call',
    attrs: { type: 'button', 'data-cal-link': slug }
  });
  document.body.appendChild(btn);
}
