// Pipeline step panel — same dialog pattern as service detail.
// Reuses the .service-detail styles via the dual class on the dialog element.

import type { ProcessStep } from '../content/process';
import { el, tree, clear } from '../lib/dom';

export interface StepDetailHandle {
  open: (step: ProcessStep) => void;
  close: () => void;
}

export function mountStepDetail(): StepDetailHandle {
  const dialog = document.createElement('dialog');
  dialog.className = 'step-detail service-detail';

  const closeBtn = el('button', {
    class: 'close', text: '×',
    attrs: { 'aria-label': 'Close panel', type: 'button' }
  });
  const content = el('div', { class: 'content' });
  dialog.appendChild(closeBtn);
  dialog.appendChild(content);
  document.body.appendChild(dialog);

  const close = () => dialog.close();
  closeBtn.addEventListener('click', close);
  dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });

  const render = (s: ProcessStep) => {
    clear(content);
    content.appendChild(el('span', { class: 'kicker', text: 'Process' }));
    content.appendChild(el('h2', { text: s.name }));
    content.appendChild(el('p', { class: 'lede', text: s.blurb }));

    const meta = el('div', { class: 'meta' });
    const dCol = el('div');
    dCol.appendChild(el('span', { class: 'label', text: 'Deliverables' }));
    dCol.appendChild(tree('ul', {}, s.deliverables.map((d) => el('li', { text: d }))));
    meta.appendChild(dCol);

    const tCol = el('div');
    tCol.appendChild(el('span', { class: 'label', text: 'Duration' }));
    tCol.appendChild(el('p', { text: s.duration }));
    meta.appendChild(tCol);

    content.appendChild(meta);
  };

  return { open: (step) => { render(step); dialog.showModal(); }, close };
}
