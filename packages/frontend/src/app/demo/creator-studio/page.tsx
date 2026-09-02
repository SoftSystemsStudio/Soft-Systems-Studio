import type { Metadata } from 'next';
import CreatorStudioDemo from './creator-studio-demo';

export const metadata: Metadata = {
  title: 'Demo: Creator Studio',
  description:
    'A fictional personal-brand portfolio site, shown as a design example of what Soft Systems Studio can build. Not a real business.',
  alternates: { canonical: '/demo/creator-studio' },
};

export default function Page() {
  return <CreatorStudioDemo />;
}
