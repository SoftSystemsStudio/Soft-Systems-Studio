import type { ClientConfig, IntakePayload } from './configTypes';

const asOptionalString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

const mapObjectiveToDepartment = (obj: string): string | undefined => {
  switch (obj) {
    case 'reduce_support_volume':
    case 'reduce_missed_calls':
      return 'support';
    case 'increase_leads':
      return 'sales';
    case 'increase_content_output':
      return 'marketing';
    case 'improve_reporting':
      return 'analytics';
    case 'automate_workflows':
      return 'operations';
    default:
      return undefined;
  }
};

export function buildClientConfigFromIntake(raw: IntakePayload): ClientConfig {
  const now = new Date().toISOString();

  const clientId =
    raw.clientId && raw.clientId.trim().length > 0 ? raw.clientId : `client-${Date.now()}`;

  const profile = {
    companyName: asOptionalString(raw.companyName) ?? 'Unknown Company',
    website: asOptionalString(raw.website),
    industry: asOptionalString(raw.industry),
    size: asOptionalString(raw.size),
  };

  const contact =
    raw.contactName || raw.contactEmail || raw.contactPhone
      ? {
          name: asOptionalString(raw.contactName),
          email: asOptionalString(raw.contactEmail),
          phone: asOptionalString(raw.contactPhone),
        }
      : undefined;

  // Build support subsystem using reported channels and daily inquiries
  const daily = raw.dailyInquiries ? Number(raw.dailyInquiries) : undefined;
  const supportSubsystem = {
    id: 'support',
    type: 'support_system' as const,
    description: 'AI Support System configured from intake support channels and volume.',
    settings: {
      channels: Array.isArray(raw.supportChannels) ? raw.supportChannels : [],
      estimatedDailyInquiries: Number.isFinite(daily) ? daily : undefined,
      mainPainPoints: asOptionalString(raw.mainPainPoints),
    },
  };

  // Build workflow subsystem using primaryObjectives as hints for target departments
  const objectives = Array.isArray(raw.primaryObjectives) ? raw.primaryObjectives : [];
  const deptSet = new Set<string>();
  objectives.forEach((o) => {
    const d = mapObjectiveToDepartment(o as string);
    if (d) deptSet.add(d);
  });

  const workflowSubsystem = {
    id: 'workflow',
    type: 'workflow_system' as const,
    description:
      'AI Workflow System designed to automate routing and follow-ups based on objectives.',
    settings: {
      targetDepartments: Array.from(deptSet).length ? Array.from(deptSet) : ['support'],
      hints: objectives,
    },
  };

  const subsystems: ClientConfig['subsystems'] = [supportSubsystem, workflowSubsystem];

  return {
    clientId,
    profile,
    contact,
    subsystems,
    createdAt: now,
    updatedAt: now,
  };
}
