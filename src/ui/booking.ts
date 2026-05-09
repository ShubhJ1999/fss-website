// Cal.com inline embed loader. Loads only on first click — keeps initial bundle clean.
// Looks for data-cal-link attributes on any element and binds the click.

let calLoaded = false;

export function attachCalLinks(): void {
  document.querySelectorAll<HTMLElement>('[data-cal-link]').forEach((node) => {
    node.addEventListener('click', () => {
      if (!calLoaded) { loadCal(); calLoaded = true; }
      const link = node.dataset.calLink ?? '';
      const w = window as unknown as { Cal?: (...args: unknown[]) => void };
      w.Cal?.('ui', { theme: 'dark' });
      w.Cal?.('modal', { calLink: link });
    });
  });
}

function loadCal(): void {
  const s = document.createElement('script');
  s.textContent = `(function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init"); Cal("init", { origin: "https://cal.com" });`;
  document.head.appendChild(s);
}
