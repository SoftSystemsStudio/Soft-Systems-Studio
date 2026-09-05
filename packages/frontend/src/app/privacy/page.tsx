import type { Metadata } from 'next';
import { Navbar, Footer } from '@/components/ui';
import { CONTACT_EMAIL } from '@/lib/business';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    "What happens to your information when you use this site, and what my own private dashboard's read-only Google Calendar and Gmail access is for.",
  alternates: { canonical: '/privacy' },
};

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Terms', href: '/terms' },
];

export default function PrivacyPage() {
  return (
    <div className="antialiased min-h-screen bg-[#050505] text-gray-200">
      <Navbar items={NAV_ITEMS} ctaLabel="Get a Quote" ctaHref="/intake" />
      <main className="max-w-3xl mx-auto px-4 py-24">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        <div className="prose prose-invert prose-gray max-w-none space-y-6 text-gray-300 leading-relaxed">
          <p>
            <strong className="text-white">Last updated:</strong> September 2026
          </p>
          <p>
            I&apos;m Austin, and I built and run this site myself. Here&apos;s what actually happens
            to your information when you use it &mdash; no boilerplate, no padding, just what&apos;s
            true.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">The contact form</h2>
          <p>
            When you fill out the intake form, your name, business name, email, phone number, and
            what you told me about your business get emailed straight to me, and to no one else. I
            use it to follow up about your project &mdash; that&apos;s the only reason it exists.
            It&apos;s sent as a plain email through Resend, not through a third-party form service.
            I don&apos;t sell it, rent it, or add you to a mailing list.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">Analytics and tracking</h2>
          <p>
            As of this writing, this site doesn&apos;t run Google Analytics or any other visitor
            tracking or advertising service. If that ever changes, this page will say so before it
            happens, not after.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">
            SSS Hub, and my own Google Calendar and Gmail
          </h2>
          <p>
            This part isn&apos;t about you or anything you do on this site &mdash; it&apos;s here
            because Google requires a public privacy policy before I&apos;m allowed to connect a
            private tool to my own Google account. If you&apos;re a visitor or a client, none of
            this involves your information.
          </p>
          <p>
            I run a private dashboard for my own business called SSS Hub. It&apos;s not a public
            product, it has no other users, and it runs on my own computer &mdash; nobody else can
            sign into it.
          </p>
          <p>To show me my own day at a glance, SSS Hub asks my Google account for two things:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <code className="text-lime-400">
                https://www.googleapis.com/auth/calendar.readonly
              </code>{' '}
              &mdash; read-only access to my calendar
            </li>
            <li>
              <code className="text-lime-400">https://www.googleapis.com/auth/gmail.readonly</code>{' '}
              &mdash; read-only access to my Gmail
            </li>
          </ul>
          <p>
            Both are strictly read-only. SSS Hub cannot send, delete, or change anything in my
            calendar or my inbox &mdash; it can only look.
          </p>
          <p>
            What it looks at, and what it does with it: it shows my next few upcoming calendar
            events, how many emails arrived in the last day, and the subject line and sender of the
            handful Gmail has already marked important &mdash; never the body of an email.
            That&apos;s the extent of it. All of it renders on a dashboard that&apos;s
            password-protected and reachable only by me. Once a day, that same summary is folded
            into a short note I keep for myself and an email I send to my own inbox, so I have a
            record of my own day &mdash; it doesn&apos;t go anywhere beyond that.
          </p>
          <p>
            The sign-in token that keeps this connected lives in a file on my own computer. It is
            excluded from source control and is never sent back out through anything the dashboard
            shows in a browser.
          </p>
          <p>None of it is sold, shared with anyone else, or used for advertising.</p>
          <p>
            You can see or revoke anything connected to a Google account, mine included, from
            Google&apos;s own permissions page:{' '}
            <a
              href="https://myaccount.google.com/permissions"
              className="text-lime-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              myaccount.google.com/permissions
            </a>
            .
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">Changes to this policy</h2>
          <p>
            If what this site or SSS Hub does with information changes, I&apos;ll update this page
            to match &mdash; it&apos;s meant to describe what&apos;s actually true, not what was
            true when I first wrote it.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8">Contact</h2>
          <p>
            Questions about any of this? Email me at{' '}
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
