// Footer "reduce motion" toggle. Persists via setMotionMode; reload required
// so timeline rebuilds.

import { el } from '../lib/dom';
import { getMotionMode, setMotionMode } from '../scene/motion';

export function mountMotionToggle(root: HTMLElement): void {
  const btn = el('button', {
    class: 'motion-toggle',
    attrs: { type: 'button' },
    on: { click: () => {
      const next = getMotionMode() === 'reduced' ? 'full' : 'reduced';
      setMotionMode(next);
      location.reload();
    }}
  });
  const render = () => {
    const mode = getMotionMode();
    btn.textContent = mode === 'reduced' ? 'Restore motion' : 'Reduce motion';
    btn.setAttribute('aria-pressed', String(mode === 'reduced'));
  };
  render();
  root.appendChild(btn);
}
