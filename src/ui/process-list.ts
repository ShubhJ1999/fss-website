// Process rendered as a numbered editorial list. Replaces the 3D pipeline + step pills.

import { PROCESS } from '../content/process';
import { el, tree } from '../lib/dom';

export function mountProcessList(root: HTMLElement): void {
  PROCESS.forEach((step, i) => {
    const item = el('div', { class: 'process-item' });
    item.appendChild(el('span', { class: 'process-num', text: String(i + 1).padStart(2, '0') }));

    const body = el('div', { class: 'process-body' });
    const titleRow = el('div', { class: 'process-title-row' });
    titleRow.appendChild(el('h3', { text: step.name }));
    titleRow.appendChild(el('span', { class: 'process-duration', text: step.duration }));
    body.appendChild(titleRow);
    body.appendChild(el('p', { class: 'process-blurb', text: step.blurb }));
    body.appendChild(el('span', { class: 'process-deliverables-label', text: 'Deliverables' }));
    body.appendChild(tree('ul', { class: 'process-deliverables' },
      step.deliverables.map((d) => el('li', { text: d }))));

    item.appendChild(body);
    root.appendChild(item);
  });
}
