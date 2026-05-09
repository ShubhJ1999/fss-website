// Plausible analytics. No-ops when VITE_PLAUSIBLE_DOMAIN is unset (dev / preview).
// Loads the script lazily; track() pushes events through the standard Plausible queue.

const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined;

export function initAnalytics(): void {
  if (!domain) return;
  const s = document.createElement('script');
  s.defer = true;
  s.src = 'https://plausible.io/js/script.js';
  s.setAttribute('data-domain', domain);
  document.head.appendChild(s);

  const inline = document.createElement('script');
  inline.textContent = 'window.plausible = window.plausible || function(){(window.plausible.q=window.plausible.q||[]).push(arguments)}';
  document.head.appendChild(inline);
}

export function track(event: string, props?: Record<string, string | number>): void {
  if (!domain) return;
  const w = window as unknown as { plausible?: (e: string, opts?: { props?: Record<string, string | number> }) => void };
  w.plausible?.(event, { props });
}
