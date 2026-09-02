import type { Metadata } from 'next';
import IntakeForm from './intake-form';

export const metadata: Metadata = {
  title: 'Get a Free Quote',
  description:
    'Get a free quote for a $997 flat website build or the AI receptionist. Serving local service businesses in Phenix City, AL and Columbus, GA.',
  alternates: { canonical: '/intake' },
};

export default function IntakePage() {
  return <IntakeForm />;
}
