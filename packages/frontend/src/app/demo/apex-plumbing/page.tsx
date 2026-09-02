import type { Metadata } from 'next';
import ApexPlumbingDemo from './apex-plumbing-demo';

export const metadata: Metadata = {
  title: 'Demo: Apex Plumbing',
  description:
    'A fictional plumbing-company website, shown as a design example of what Soft Systems Studio can build for a local service business. Not a real business.',
  alternates: { canonical: '/demo/apex-plumbing' },
};

export default function Page() {
  return <ApexPlumbingDemo />;
}
