// SEO helpers — JSON-LD generators for Organization and Service schema.
// Site URL constant centralized so a domain rename is a one-line change.

const SITE_URL = 'https://fermionsoftwaresolutions.com';

export interface OrganizationJsonLd {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  description: string;
}

export function organizationJsonLd(): OrganizationJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Fermion Software Solutions',
    url: SITE_URL,
    logo: `${SITE_URL}/fss-logo.png`,
    description: 'Custom software, ML, automation, and cloud systems for teams that need real outcomes.'
  };
}

export interface ServiceJsonLd {
  '@context': 'https://schema.org';
  '@type': 'Service';
  name: string;
  description: string;
  provider: { '@type': 'Organization'; name: string; url: string };
}

export function serviceJsonLd(name: string, description: string): ServiceJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name, description,
    provider: { '@type': 'Organization', name: 'Fermion Software Solutions', url: SITE_URL }
  };
}
