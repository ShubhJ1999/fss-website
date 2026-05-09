// Service detail panel: opens when a service tag is clicked. Native <dialog>
// for focus trap + Esc-to-close. Built with safe DOM (no innerHTML).

import type { Service } from '../content/services';
import { el, tree, clear } from '../lib/dom';
import { track } from '../lib/analytics';

export interface ServiceDetailHandle {
  open: (service: Service) => void;
  close: () => void;
}

export function mountServiceDetail(): ServiceDetailHandle {
  const dialog = document.createElement('dialog');
  dialog.className = 'service-detail';

  const closeBtn = el('button', {
    class: 'close',
    text: '×',
    attrs: { 'aria-label': 'Close panel', type: 'button' }
  });

  const content = el('div', { class: 'content' });

  dialog.appendChild(closeBtn);
  dialog.appendChild(content);
  document.body.appendChild(dialog);

  const close = () => dialog.close();
  closeBtn.addEventListener('click', close);
  dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });

  const render = (s: Service) => {
    clear(content);
    content.appendChild(el('span', { class: 'kicker', text: s.cluster }));
    content.appendChild(el('h2', { text: s.name }));
    content.appendChild(el('p', { class: 'lede', text: s.blurb }));
    for (const para of s.body) content.appendChild(el('p', { text: para }));

    const meta = el('div', { class: 'meta' });
    const stackCol = el('div');
    stackCol.appendChild(el('span', { class: 'label', text: 'Stack' }));
    stackCol.appendChild(tree('ul', {}, s.stack.map((x) => el('li', { text: x }))));
    meta.appendChild(stackCol);

    const timelineCol = el('div');
    timelineCol.appendChild(el('span', { class: 'label', text: 'Timeline' }));
    timelineCol.appendChild(el('p', { text: s.timeline }));
    meta.appendChild(timelineCol);

    content.appendChild(meta);
  };

  return {
    open: (service) => { render(service); dialog.showModal(); track('service_detail_open', { slug: service.slug }); },
    close
  };
}
