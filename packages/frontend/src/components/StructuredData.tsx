/**
 * Structured Data (JSON-LD) Components for SEO
 *
 * These components add rich snippets to improve search engine understanding
 * and enable enhanced search results (rich cards, knowledge panels, etc.)
 *
 * Deliberately plain <script> tags, not next/script: next/script's default
 * `afterInteractive` strategy injects the tag client-side after hydration,
 * so it never appears in the server-rendered HTML crawlers (and curl) see —
 * which defeats the entire point of JSON-LD. A plain <script> is a normal
 * host element and gets server-rendered like any other markup. This matches
 * Next.js's own documented pattern for JSON-LD.
 */

import {
  BUILD_FEE,
  RETAINER_MIN,
  RETAINER_MAX,
  SERVICE_AREA_CITIES,
  BUSINESS_PHONE,
} from '@/lib/business';

interface FAQ {
  question: string;
  answer: string;
}

/**
 * Organization Schema - Helps Google understand your business
 */
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Soft Systems Studio LLC',
    url: 'https://softsystemsstudiollc.com',
    logo: 'https://softsystemsstudiollc.com/images/soft-systems-logo.png',
    description:
      'Website builds and an AI receptionist for local service businesses in and around Phenix City, AL and Columbus, GA.',
    sameAs: [
      // Add your social media profiles here
      // 'https://twitter.com/softsystems',
      // 'https://linkedin.com/company/soft-systems-studio',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      url: 'https://softsystemsstudiollc.com/intake',
    },
  };

  return (
    <script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * LocalBusiness Schema - service-area business, no street address.
 *
 * Austin works from home; we were told explicitly not to publish a home
 * address. `areaServed` carries the geo signal instead of `address`. Phone
 * is added automatically once BUSINESS_PHONE (lib/business.ts) is set —
 * until then this schema simply omits `telephone` rather than invent one.
 */
export function LocalBusinessSchema() {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'Soft Systems Studio LLC',
    url: 'https://softsystemsstudiollc.com',
    image: 'https://softsystemsstudiollc.com/images/soft-systems-logo.png',
    description:
      'Website builds and an AI receptionist for local service businesses — serving Phenix City and Smiths Station, AL, and Columbus, GA.',
    priceRange: `${BUILD_FEE} / ${RETAINER_MIN}-${RETAINER_MAX} per month`,
    areaServed: (SERVICE_AREA_CITIES as string[]).map((name: string) => ({
      '@type': 'City',
      name,
    })),
  };

  if (BUSINESS_PHONE) {
    schema.telephone = BUSINESS_PHONE;
  }

  return (
    <script
      id="local-business-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * FAQ Schema - Enables FAQ rich results in Google Search
 */
export function FAQSchema({ faqs }: { faqs: FAQ[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * WebSite Schema - basic site identity for search engines.
 *
 * No `potentialAction`/`SearchAction` here on purpose: the site has no
 * search feature, so promising Google a `/?s={search_term_string}` box
 * would just fail if anyone used it.
 */
export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Soft Systems Studio',
    url: 'https://softsystemsstudiollc.com',
  };

  return (
    <script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
