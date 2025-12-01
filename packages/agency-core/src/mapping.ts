import type { ClientConfig, IntakePayload } from './configTypes';

// Treat the intake as a loose record of unknown values.
// This avoids `any` while still letting us index by field name.
type LooseIntake = IntakePayload & Record<string, unknown>;

const asOptionalString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

export function buildClientConfigFromIntake(raw: IntakePayload): ClientConfig {
  const now = new Date().toISOString();
  const base = raw as LooseIntake;

  const clientId =
    typeof base.clientId === 'string' && base.clientId.trim().length > 0
      ? base.clientId
      : `client-${Date.now()}`;

  const profile = {
    companyName: asOptionalString(base.companyName) ?? 'Unknown Company',
    website: asOptionalString(base.website),
    industry: asOptionalString(base.industry),
    size: asOptionalString(base.size),
  };

  const contact = {
    name: asOptionalString(base.contactName),
    email: asOptionalString(base.contactEmail),
    phone: asOptionalString(base.contactPhone),
  };

  // Default Phase 1 focus: Support + Workflow for every intake
  const subsystems: ClientConfig['subsystems'] = [
    {
      id: 'support',
      type: 'support_system',
      description:
        'AI Support System for web chat to handle FAQs and route complex issues to humans.',
      settings: {
        channels: ['web_chat'],
        allowTopics: ['faq', 'basic_support'],
        escalationPolicy: ['low_confidence', 'negative_sentiment'],
      },
    },
    {
      id: 'workflow',
      type: 'workflow_system',
      description:
        'AI Workflow Automation System for inquiry routing and simple follow-up workflows.',
      settings: {
        targetDepartments: ['support'],
        flows: ['inquiry_routing', 'basic_followup'],
      },
    },
  ];

  return {
    clientId,
    profile,
    contact,
    subsystems,
    createdAt: now,
    updatedAt: now,
  };
}
