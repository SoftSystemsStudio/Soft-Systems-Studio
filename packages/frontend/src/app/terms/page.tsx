import type { Metadata } from 'next';
import { Navbar, Footer } from '@/components/ui';
import { CONTACT_EMAIL } from '@/lib/business';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for Soft Systems Studio LLC.',
  alternates: { canonical: '/terms' },
};

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Privacy', href: '/privacy' },
];

export default function TermsPage() {
  return (
    <div className="antialiased min-h-screen bg-[#050505] text-gray-200">
      <Navbar items={NAV_ITEMS} ctaLabel="Get a Quote" ctaHref="/intake" />
      <main className="max-w-3xl mx-auto px-4 py-24">
        <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
        <div className="prose prose-invert prose-gray max-w-none space-y-6 text-gray-300 leading-relaxed">
          <p>
            <strong className="text-white">Last updated:</strong> September 2026
          </p>
          <p>
            By using Soft Systems Studio LLC services, you agree to these terms. Please read them
            carefully.
          </p>
          <h2 className="text-2xl font-semibold text-white mt-8">Services</h2>
          <p>
            We provide custom AI automation solutions, websites, and related software services. All
            projects are scoped and priced individually.
          </p>
          <h2 className="text-2xl font-semibold text-white mt-8">Payment Terms</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>The website build fee is due upfront before work begins</li>
            <li>Retainer fees are billed at the beginning of each month</li>
            <li>All payments are processed via Stripe</li>
            <li>Refund terms are agreed on a per-project basis before work begins</li>
          </ul>
          <h2 className="text-2xl font-semibold text-white mt-8">Cancellation</h2>
          <p>
            You may cancel a monthly retainer at any time. No refunds for partial months. The
            website build fee is non-refundable once work has begun.
          </p>
          <h2 className="text-2xl font-semibold text-white mt-8">Intellectual Property</h2>
          <p>
            Upon full payment, you own the final deliverables. We retain rights to reusable code,
            frameworks, and tools used in development.
          </p>
          <h2 className="text-2xl font-semibold text-white mt-8">Warranties and Disclaimers</h2>
          <p>
            We provide services &quot;as-is&quot; without warranty. We are not liable for indirect
            damages, lost profits, or consequential damages.
          </p>
          <h2 className="text-2xl font-semibold text-white mt-8">Changes to Terms</h2>
          <p>
            We may update these terms at any time. Continued use of our services after changes
            constitutes acceptance.
          </p>
          <h2 className="text-2xl font-semibold text-white mt-8">Contact</h2>
          <p>
            Questions? Email us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-lime-400 hover:underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
