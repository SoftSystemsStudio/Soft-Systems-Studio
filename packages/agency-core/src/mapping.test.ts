import { buildClientConfigFromIntake } from './mapping';
import type { IntakePayload } from './configTypes';

describe('buildClientConfigFromIntake', () => {
  it('maps intake payload into a normalized ClientConfig', () => {
    const payload: IntakePayload = {
      companyName: 'Test Company',
      website: 'https://example.com',
      industry: 'SaaS',
      size: '11-50',
      primaryObjectives: ['reduce_support_volume', 'increase_leads'],
      systems: ['support', 'workflow'],
      websitePlatform: 'webflow',
      crm: 'hubspot',
      helpdesk: 'zendesk',
      telephony: 'twilio',
      calendar: 'google_calendar',
      dailyInquiries: '25',
      supportChannels: ['email', 'web_chat'],
      mainPainPoints: 'Slow response times and lots of manual routing.',
      contactName: 'Jane Doe',
      contactEmail: 'jane@example.com',
      contactPhone: '+1-555-123-4567',
      notes: 'We want a Phase 1 focused on support and workflows.',
    };

    const config = buildClientConfigFromIntake(payload);

    // profile
    expect(config.profile.companyName).toBe(payload.companyName);
    expect(config.profile.website).toBe(payload.website);
    expect(config.profile.industry).toBe(payload.industry);
    expect(config.profile.size).toBe(payload.size);

    // contact
    expect(config.contact?.name).toBe(payload.contactName);
    expect(config.contact?.email).toBe(payload.contactEmail);
    expect(config.contact?.phone).toBe(payload.contactPhone);

    // ids & timestamps
    expect(config.clientId).toBeDefined();
    expect(config.createdAt).toBeDefined();
    expect(config.updatedAt).toBeDefined();

    // subsystems
    const support = config.subsystems.find((s) => s.type === 'support_system');
    const workflow = config.subsystems.find((s) => s.type === 'workflow_system');

    expect(support).toBeDefined();
    const supportSettings = support!.settings as any;
    expect(supportSettings.channels).toEqual(payload.supportChannels);
    expect(supportSettings.estimatedDailyInquiries).toBe(Number(payload.dailyInquiries));
    expect(supportSettings.mainPainPoints).toBe(payload.mainPainPoints);

    expect(workflow).toBeDefined();
    const workflowSettings = workflow!.settings as any;
    expect(workflowSettings.hints).toEqual(payload.primaryObjectives);
    expect(Array.isArray(workflowSettings.targetDepartments)).toBe(true);
    expect(workflowSettings.targetDepartments.length).toBeGreaterThan(0);
  });
});
