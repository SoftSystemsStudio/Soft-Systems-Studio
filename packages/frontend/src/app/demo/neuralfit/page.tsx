import type { Metadata } from 'next';
import NeuralFitDemo from './neuralfit-demo';

export const metadata: Metadata = {
  title: 'Demo: NeuralFit',
  description:
    'A fictional SaaS fitness-app website, shown as a design example of what Soft Systems Studio can build. Not a real product.',
  alternates: { canonical: '/demo/neuralfit' },
};

export default function Page() {
  return <NeuralFitDemo />;
}
