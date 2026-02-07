import type { Metadata } from 'next';
import IntakeForm from './intake-form';

export const metadata: Metadata = {
  title: 'Get a Free Quote',
  description:
    'Get a free quote for your website or AI receptionist. We help local service businesses never miss a call again.',
};

export default function IntakePage() {
  return <IntakeForm />;
}
