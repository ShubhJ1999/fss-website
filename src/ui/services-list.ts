// Services rendered as a categorized DOM list (Build / Run / Grow).
// Replaces the 3D constellation. Click on a service opens the detail panel.

import { SERVICES, type ServiceCluster, type Service } from '../content/services';
import { el, tree } from '../lib/dom';

const CLUSTER_ORDER: ServiceCluster[] = ['Build', 'Run', 'Grow'];
const CLUSTER_BLURB: Record<ServiceCluster, string> = {
  Build: 'Greenfield work — products, platforms, integrations.',
  Run:   'Keep things up — hosting, testing, infra, on-call.',
  Grow:  'Reach further — automation, marketing infra, training.'
};

export function mountServicesList(root: HTMLElement, onSelect: (s: Service) => void): void {
  for (const cluster of CLUSTER_ORDER) {
    const services = SERVICES.filter((s) => s.cluster === cluster);
    if (services.length === 0) continue;

    const block = el('div', { class: 'svc-cluster' });
    block.appendChild(el('h3', { text: cluster }));
    block.appendChild(el('p', { class: 'svc-cluster-blurb', text: CLUSTER_BLURB[cluster] }));

    const list = tree('ul', { class: 'svc-list' }, services.map((s) => {
      const li = el('li');
      const btn = el('button', {
        class: 'svc-item',
        attrs: { type: 'button' },
        on: { click: () => onSelect(s) }
      });
      btn.appendChild(el('span', { class: 'svc-name', text: s.name }));
      btn.appendChild(el('span', { class: 'svc-blurb', text: s.blurb }));
      li.appendChild(btn);
      return li;
    }));

    block.appendChild(list);
    root.appendChild(block);
  }
}
