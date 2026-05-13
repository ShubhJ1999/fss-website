// Production server for Railway. Serves the Vite-built dist/ as static assets
// and handles POST /api/contact by relaying through Resend.

import express from 'express';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { validatePayload } from './validate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? '';

function escapeHtml(s) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(s).replace(/[&<>"']/g, (c) => map[c]);
}

async function sendEmail(to, subject, html) {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'Fermion <noreply@fermionsoftwaresolutions.com>',
      to,
      subject,
      html
    })
  });
}

const app = express();
app.use(express.json({ limit: '10kb' }));

app.post('/api/contact', async (req, res) => {
  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL) {
    return res.status(500).json({ error: 'email-not-configured' });
  }

  const v = validatePayload(req.body);
  if (!v.ok) return res.status(400).json({ error: 'invalid', field: v.reason });

  const p = req.body;
  const recipients = CONTACT_TO_EMAIL.split(',').map((s) => s.trim()).filter(Boolean);

  try {
    const [notif, reply] = await Promise.all([
      sendEmail(
        recipients,
        `New lead: ${p.name}`,
        `<p><strong>${escapeHtml(p.name)}</strong> (${escapeHtml(p.email)})</p>
         <p><strong>Project:</strong></p><p>${escapeHtml(p.project)}</p>
         ${p.budget ? `<p><strong>Budget:</strong> ${escapeHtml(p.budget)}</p>` : ''}`
      ),
      sendEmail(
        p.email,
        'We got your message — Fermion Software Solutions',
        `<p>Hey ${escapeHtml(p.name)},</p>
         <p>Thanks for reaching out. We'll review what you sent and respond within a working day.</p>
         <p>— Fermion Software Solutions</p>`
      )
    ]);
    if (!notif.ok || !reply.ok) {
      return res.status(502).json({ error: 'send-failed' });
    }
    return res.json({ ok: true });
  } catch {
    return res.status(502).json({ error: 'send-failed' });
  }
});

app.use(express.static(path.join(__dirname, 'dist')));

app.use((_req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'dist', '404.html'));
});

app.listen(PORT, () => console.log(`fss-website listening on :${PORT}`));
