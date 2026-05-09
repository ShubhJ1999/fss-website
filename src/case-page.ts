// Shared bootstrap for case-study pages. Reads data-slug from <main>, looks up
// content, renders into <article>. No 3D, no GSAP — fast LCP.

import './styles-case.css';
import { CASE_STUDIES } from './content/case-studies';
import { el, tree, clear } from './lib/dom';

const main = document.querySelector<HTMLElement>('main.case');
if (!main) throw new Error('Missing <main class="case">');

const slug = main.dataset.slug ?? '';
const study = CASE_STUDIES.find((c) => c.slug === slug);
const article = main.querySelector<HTMLElement>('article');
if (!article) throw new Error('Missing <article> in main.case');

if (!study) {
  article.appendChild(el('p', { text: 'Case study not found.' }));
} else {
  clear(article);
  article.appendChild(el('p', { class: 'kicker', text: 'Case study' }));
  article.appendChild(el('h1', { text: study.client }));
  article.appendChild(el('p', { class: 'lede', text: study.tagline }));

  const problemSection = el('section');
  problemSection.appendChild(el('h2', { text: 'Problem' }));
  problemSection.appendChild(el('p', { text: study.problem }));
  article.appendChild(problemSection);

  const approachSection = el('section');
  approachSection.appendChild(el('h2', { text: 'Approach' }));
  approachSection.appendChild(tree('ul', {}, study.approach.map((s) => el('li', { text: s }))));
  article.appendChild(approachSection);

  const resultSection = el('section');
  resultSection.appendChild(el('h2', { text: 'Result' }));
  const stats = el('div', { class: 'stats' });
  for (const r of study.result) {
    const stat = el('div', { class: 'stat' });
    stat.appendChild(el('span', { class: 'value', text: r.value }));
    stat.appendChild(el('span', { class: 'metric', text: r.metric }));
    stats.appendChild(stat);
  }
  resultSection.appendChild(stats);
  article.appendChild(resultSection);

  const back = el('a', {
    class: 'back', text: '← Back to Fermion',
    attrs: { href: '/' }
  });
  article.appendChild(back);
}
