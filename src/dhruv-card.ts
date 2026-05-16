// Bootstrap for the Dhruv digital visiting card. Wires the Save Contact button
// to a client-side vCard 3.0 download — no third-party service, no analytics.

import './styles-card.css';
import { DHRUV } from './content/dhruv-card';

const VCARD = [
  'BEGIN:VCARD',
  'VERSION:3.0',
  `N:${DHRUV.lastName};${DHRUV.firstName};;;`,
  `FN:${DHRUV.name}`,
  `ORG:${DHRUV.primaryRole.org}`,
  `TITLE:${DHRUV.primaryRole.title}`,
  `TEL;TYPE=CELL;TYPE=PREF:${DHRUV.phoneRaw}`,
  `EMAIL;TYPE=WORK;TYPE=PREF:${DHRUV.email}`,
  'ADR;TYPE=WORK:;;;Ahmedabad;Gujarat;;India',
  'URL:https://www.linkedin.com/in/the-dkpatel/',
  'URL:https://thedkpatel.com',
  'URL:https://fermionsoftwaresolutions.com',
  `NOTE:${DHRUV.bio}`,
  'END:VCARD'
].join('\r\n');

const btn = document.getElementById('save-contact');
if (btn) {
  btn.addEventListener('click', () => {
    const blob = new Blob([VCARD], { type: 'text/vcard;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = 'Dhruv-Patel-Fermion.vcf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  });
}
