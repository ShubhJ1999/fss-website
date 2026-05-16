// Content for Dhruv Patel's digital visiting card. Pulled from public LinkedIn.
// Edit values here and the live card + vCard download update on next build.

export const DHRUV = {
  name: 'Dhruv Patel',
  firstName: 'Dhruv',
  lastName: 'Patel',
  primaryRole: { title: 'Founder, Engineer', org: 'Fermion Software Solutions' },
  secondaryRole: { title: 'Senior Software Engineer', org: 'EPAM Systems' },
  bio: 'Senior backend engineer working on scalable systems, data platforms, and AI-powered applications. Strong in Python and FastAPI, event-driven architectures, and cloud-native infrastructure across AWS, GCP, and Azure.',
  tag: 'Python · FastAPI · Distributed Systems · AWS · GCP · Kubernetes',
  location: 'Ahmedabad, India',
  email: 'dhruv@thedkpatel.com',
  phone: '+91 81539 65115',
  phoneRaw: '+918153965115',
  booking: 'https://cal.com/fermion/intro',
  links: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/the-dkpatel/' },
    { label: 'Personal site', href: 'https://thedkpatel.com' },
    { label: 'fermionsoftwaresolutions.com', href: 'https://fermionsoftwaresolutions.com' }
  ],
  pageUrl: 'https://fermionsoftwaresolutions.com/dhruv'
} as const;
