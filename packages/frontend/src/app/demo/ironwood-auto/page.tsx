import type { Metadata } from 'next';
import IronwoodAutoDemo from './ironwood-auto-demo';

export const metadata: Metadata = {
  title: 'Demo: Ironwood Auto & Tire',
  description:
    'A fictional auto repair shop website, shown as a design example of what Soft Systems Studio can build for a phone-first, urgency-driven local service business. Not a real business.',
  alternates: { canonical: '/demo/ironwood-auto' },
};

export default function Page() {
  return <IronwoodAutoDemo />;
}
