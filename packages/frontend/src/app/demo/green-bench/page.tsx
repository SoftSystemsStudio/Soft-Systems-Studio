import type { Metadata } from 'next';
import GreenBenchDemo from './green-bench-demo';

export const metadata: Metadata = {
  title: 'Demo: Green Bench Lawn & Landscape',
  description:
    'A fictional lawn care and landscaping website, shown as a design example of what Soft Systems Studio can build for a portfolio-driven, seasonal local business. Not a real business.',
  alternates: { canonical: '/demo/green-bench' },
};

export default function Page() {
  return <GreenBenchDemo />;
}
