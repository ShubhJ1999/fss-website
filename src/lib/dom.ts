// Safe DOM construction helpers. Always use these instead of innerHTML for
// dynamic content — text passes through textContent, never parsed as HTML.

type ElOpts = {
  class?: string;
  text?: string;
  attrs?: Record<string, string>;
  on?: Partial<{ click: (e: MouseEvent) => void; submit: (e: SubmitEvent) => void }>;
};

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  opts: ElOpts = {}
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (opts.class) node.className = opts.class;
  if (opts.text != null) node.textContent = opts.text;
  if (opts.attrs) {
    for (const [k, v] of Object.entries(opts.attrs)) node.setAttribute(k, v);
  }
  if (opts.on?.click) node.addEventListener('click', opts.on.click as EventListener);
  if (opts.on?.submit) node.addEventListener('submit', opts.on.submit as EventListener);
  return node;
}

export function tree<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  opts: ElOpts,
  children: Array<Node | string>
): HTMLElementTagNameMap[K] {
  const root = el(tag, opts);
  for (const c of children) {
    root.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return root;
}

export function clear(node: Element): void {
  while (node.firstChild) node.removeChild(node.firstChild);
}
