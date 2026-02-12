import type { Metadata } from 'next';
import { Navbar, Footer } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Soft Systems Studio LLC.',
};

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Terms', href: '/terms' },
];

export default function PrivacyPage() {
  return (
    <div className="antialiased min-h-screen bg-[#050505] text-gray-200">
      <Navbar items={NAV_ITEMS} ctaLabel="Get Started" ctaHref="/intake" />
      <main className="max-w-3xl mx-auto px-4 py-24">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        <div className="prose prose-invert prose-gray max-w-none space-y-6 text-gray-300 leading-relaxed">
          <p>
            <strong className="text-white">Last updated:</strong> February 2026
          </p>
          <p>
            Soft Systems Studio LLC (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates
            softsystemsstudiollc.com. This page informs you of our policies regarding the
            collection, use, and disclosure of personal information.
          </p>
          <h2 className="text-2xl font-semibold text-white mt-8">Information We Collect</h2>
          <p>
            We collect information you provide directly: name, email, phone number, and business
            details when you submit our intake form or contact us.
          </p>
          <h2 className="text-2xl font-semibold text-white mt-8">How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To respond to your inquiries and provide our services</li>
            <li>To send you project updates and invoices</li>
            <li>To improve our website and services</li>
            <li>To comply with legal obligations</li>
          </ul>
          <h2 className="text-2xl font-semibold text-white mt-8">Third-Party Services</h2>
          <p>
            We use Clerk for authentication, Stripe for payments, Resend for email, and Google
            Analytics for website analytics. Each service has its own privacy policy.
          </p>
          <h2 className="text-2xl font-semibold text-white mt-8">Data Retention</h2>
          <p>
            We retain your data for as long as necessary to provide our services. You can request
            deletion of your data at any time by emailing us.
          </p>
          <h2 className="text-2xl font-semibold text-white mt-8">Contact Us</h2>
          <p>
            If you have questions about this privacy policy, contact us at{' '}
            <a
              href="mailto:hello@softsystemsstudiollc.com"
              className="text-lime-400 hover:underline"
            >
              hello@softsystemsstudiollc.com
            </a>
            .
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
