import type { Metadata } from 'next';
import VoltStoreDemo from './voltstore-demo';

export const metadata: Metadata = {
  title: 'Demo: VoltStore',
  description:
    'A fictional e-commerce storefront, shown as a design example of what Soft Systems Studio can build. Not a real store.',
  alternates: { canonical: '/demo/voltstore' },
};

export default function Page() {
  return <VoltStoreDemo />;
}
