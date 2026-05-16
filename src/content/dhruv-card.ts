// Content for Dhruv Patel's digital visiting card. Pulled from public LinkedIn.
// Edit values here and the live card + vCard download update on next build.

export const DHRUV = {
  name: 'Dhruv Patel',
  firstName: 'Dhruv',
  lastName: 'Patel',
  primaryRole: { title: 'Founder, Engineer', org: 'Fermion Software Solutions' },
  secondaryRole: { title: 'Senior Software Engineer', org: 'EPAM Systems' },
  tag: 'Backend, distributed systems, AI and data platforms. FastAPI · Python · AWS · GCP · Kubernetes.',
  location: 'Ahmedabad, India',
  email: 'dhruv@thedkpatel.com',
  links: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/the-dkpatel/' },
    { label: 'Personal site', href: 'https://thedkpatel.com' },
    { label: 'fermionsoftwaresolutions.com', href: 'https://fermionsoftwaresolutions.com' }
  ],
  pageUrl: 'https://fermionsoftwaresolutions.com/dhruv'
} as const;
