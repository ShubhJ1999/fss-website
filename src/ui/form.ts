// Contact form: client-side validation, POST to /api/contact, inline status.
// Built with safe-DOM helpers; no innerHTML on any user-derived path.

import { el, clear } from '../lib/dom';

export interface FormFields {
  name: string;
  email: string;
  project: string;
  budget?: string;
}

export interface Validation {
  valid: boolean;
  errors: Partial<Record<keyof FormFields, string>>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateFields(f: FormFields): Validation {
  const errors: Validation['errors'] = {};
  if (!f.name.trim()) errors.name = 'Tell us your name.';
  if (!EMAIL_RE.test(f.email)) errors.email = 'That email looks off.';
  if (f.project.trim().length < 5) errors.project = 'A few words about the project would help.';
  return { valid: Object.keys(errors).length === 0, errors };
}

interface FormOpts { endpoint: string; }

export function mountForm(root: HTMLElement, opts: FormOpts): void {
  clear(root);

  const form = el('form', {
    class: 'contact-form',
    attrs: { novalidate: 'novalidate' }
  });

  const labelName = el('label', { text: 'Name' });
  const inputName = el('input', { attrs: { name: 'name', required: 'required', autocomplete: 'name' } });
  labelName.appendChild(inputName);

  const labelEmail = el('label', { text: 'Email' });
  const inputEmail = el('input', { attrs: { name: 'email', type: 'email', required: 'required', autocomplete: 'email' } });
  labelEmail.appendChild(inputEmail);

  const labelProject = el('label', { text: 'What are you trying to ship?' });
  const inputProject = el('textarea', { attrs: { name: 'project', rows: '4', required: 'required' } });
  labelProject.appendChild(inputProject);

  const labelBudget = el('label', { text: 'Budget (optional)' });
  const inputBudget = el('input', { attrs: { name: 'budget', placeholder: '$10k / scope-dependent / not yet' } });
  labelBudget.appendChild(inputBudget);

  const submit = el('button', { text: 'Send', attrs: { type: 'submit' } });
  const status = el('p', { class: 'form-status', attrs: { role: 'status', 'aria-live': 'polite' } });

  form.appendChild(labelName);
  form.appendChild(labelEmail);
  form.appendChild(labelProject);
  form.appendChild(labelBudget);
  form.appendChild(submit);
  form.appendChild(status);
  root.appendChild(form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data: FormFields = {
      name: (inputName as HTMLInputElement).value,
      email: (inputEmail as HTMLInputElement).value,
      project: (inputProject as HTMLTextAreaElement).value,
      budget: (inputBudget as HTMLInputElement).value || undefined
    };
    const { valid, errors } = validateFields(data);
    form.querySelectorAll('label').forEach((l) => l.classList.remove('error'));
    if (!valid) {
      Object.keys(errors).forEach((key) => {
        const input = form.querySelector<HTMLElement>(`[name="${key}"]`);
        input?.parentElement?.classList.add('error');
      });
      status.textContent = 'Fix the highlighted fields.';
      status.className = 'form-status err';
      return;
    }
    status.textContent = 'Sending…';
    status.className = 'form-status';
    try {
      const res = await fetch(opts.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`Server ${res.status}`);
      status.textContent = 'Sent. We\'ll respond within a working day.';
      status.className = 'form-status ok';
      form.reset();
    } catch {
      status.textContent = 'Couldn\'t send — try again or email support@fermionsoftwaresolutions.com directly.';
      status.className = 'form-status err';
    }
  });
}
