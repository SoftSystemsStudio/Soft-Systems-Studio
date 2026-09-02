import type { Metadata } from 'next';
import KettleAndGrainDemo from './kettle-and-grain-demo';

export const metadata: Metadata = {
  title: 'Demo: Kettle & Grain Coffee Co.',
  description:
    'A fictional coffee shop website, shown as a design example of what Soft Systems Studio can build for a local business that sells atmosphere over urgency. Not a real business.',
  alternates: { canonical: '/demo/kettle-and-grain' },
};

export default function Page() {
  return <KettleAndGrainDemo />;
}
