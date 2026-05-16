// Build-time sitemap generator. Reads case-studies content, emits public/sitemap.xml
// which Vite then copies into dist/.

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { CASE_STUDIES } from '../src/content/case-studies';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SITE = 'https://fermionsoftwaresolutions.com';
const today = new Date().toISOString().slice(0, 10);

const urls = [
  { loc: `${SITE}/`, priority: '1.0' },
  { loc: `${SITE}/dhruv`, priority: '0.6' },
  ...CASE_STUDIES.map((c) => ({ loc: `${SITE}/pages/${c.slug}.html`, priority: '0.7' }))
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>
`;

writeFileSync(resolve(__dirname, '../public/sitemap.xml'), xml);
console.log(`Wrote sitemap with ${urls.length} entries.`);
