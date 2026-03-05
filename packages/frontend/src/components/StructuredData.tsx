/**
 * Structured Data (JSON-LD) Components for SEO
 *
 * These components add rich snippets to improve search engine understanding
 * and enable enhanced search results (rich cards, knowledge panels, etc.)
 */

import Script from 'next/script';

interface Product {
  name: string;
  price: string;
  description: string;
  link: string;
}

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
      'Digital products, AI-powered websites, and intelligent automation for entrepreneurs who refuse to waste time.',
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
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Product Schema - Helps Google show rich product cards in search
 */
export function ProductListSchema({ products }: { products: Product[] }) {
  const schemas = products.map((product) => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    offers: {
      '@type': 'Offer',
      price: product.price.replace('$', ''),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: product.link,
      seller: {
        '@type': 'Organization',
        name: 'Soft Systems Studio LLC',
      },
    },
    brand: {
      '@type': 'Brand',
      name: 'Soft Systems Studio',
    },
  }));

  return (
    <Script
      id="product-list-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
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
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * WebSite Schema - Enables sitelinks search box in Google
 */
export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Soft Systems Studio',
    url: 'https://softsystemsstudiollc.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://softsystemsstudiollc.com/?s={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
