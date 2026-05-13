// Cloudflare Pages Function for the contact form.
// Validates payload, sends notification + auto-reply via Resend.

/// <reference types="@cloudflare/workers-types" />

import { validatePayload, type Payload } from '../_lib/validate';

interface Env {
  RESEND_API_KEY: string;
  CONTACT_TO_EMAIL: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: Partial<Payload>;
  try { body = await request.json(); }
  catch { return new Response('Bad JSON', { status: 400 }); }

  const v = validatePayload(body);
  if (!v.ok) {
    return new Response(JSON.stringify({ error: 'invalid', field: v.reason }), { status: 400 });
  }

  const p = body as Payload;

  const sendEmail = (to: string | string[], subject: string, html: string) =>
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Fermion <noreply@fermionsoftwaresolutions.com>',
        to, subject, html
      })
    });

  const recipients = env.CONTACT_TO_EMAIL.split(',').map((s) => s.trim()).filter(Boolean);
  const notif = sendEmail(recipients,
    `New lead: ${p.name}`,
    `<p><strong>${p.name}</strong> (${p.email})</p>
     <p><strong>Project:</strong></p><p>${escapeHtml(p.project)}</p>
     ${p.budget ? `<p><strong>Budget:</strong> ${escapeHtml(p.budget)}</p>` : ''}`
  );

  const reply = sendEmail(p.email,
    'We got your message — Fermion Software Solutions',
    `<p>Hey ${escapeHtml(p.name)},</p>
     <p>Thanks for reaching out. We'll review what you sent and respond within a working day.</p>
     <p>— Fermion Software Solutions</p>`
  );

  const results = await Promise.all([notif, reply]);
  if (results.some((r) => !r.ok)) {
    return new Response(JSON.stringify({ error: 'send-failed' }), { status: 502 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

function escapeHtml(s: string): string {
  const map: Record<string, string> = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  };
  return s.replace(/[&<>"']/g, (c) => map[c]);
}
