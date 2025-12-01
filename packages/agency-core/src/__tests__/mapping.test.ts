import { buildClientConfigFromIntake } from '../mapping';
import type { IntakePayload } from '../configTypes';

describe('buildClientConfigFromIntake', () => {
  it('builds ClientConfig correctly from an IntakePayload', () => {
    const payload: IntakePayload = {
      companyName: 'Test Co',
      website: 'https://example.com',
      industry: 'SaaS',
      size: '11-50',
      primaryObjectives: ['reduce_support_volume', 'increase_leads'],
      systems: ['support', 'workflow'],
      websitePlatform: 'custom',
      crm: 'hubspot',
      helpdesk: 'zendesk',
      telephony: 'twilio',
      calendar: 'google_calendar',
      dailyInquiries: '12',
      supportChannels: ['web_chat', 'email'],
      mainPainPoints: 'Too many repetitive support questions.',
      contactName: 'Jane Doe',
      contactEmail: 'jane@example.com',
      contactPhone: '+1 555 555 5555',
      notes: 'Looking to automate initial triage',
    };

    const cfg = buildClientConfigFromIntake(payload);

    // Profile
    expect(cfg.profile.companyName).toBe(payload.companyName);
    expect(cfg.profile.website).toBe(payload.website);
    expect(cfg.profile.industry).toBe(payload.industry);
    expect(cfg.profile.size).toBe(payload.size);

    // Contact
    expect(cfg.contact).toBeDefined();
    expect(cfg.contact?.name).toBe(payload.contactName);
    expect(cfg.contact?.email).toBe(payload.contactEmail);
    expect(cfg.contact?.phone).toBe(payload.contactPhone);

    // Subsystems - should contain support_system and workflow_system
    const types = cfg.subsystems.map((s) => s.type);
    expect(types).toEqual(expect.arrayContaining(['support_system', 'workflow_system']));

    const support = cfg.subsystems.find((s) => s.type === 'support_system');
    expect(support).toBeDefined();
    expect(support?.settings).toBeDefined();
    expect(support?.settings?.channels).toEqual(expect.arrayContaining(payload.supportChannels));
    expect(support?.settings?.estimatedDailyInquiries).toBe(Number(payload.dailyInquiries));

    const workflow = cfg.subsystems.find((s) => s.type === 'workflow_system');
    expect(workflow).toBeDefined();
    expect(workflow?.settings).toBeDefined();
    // primaryObjectives ['reduce_support_volume','increase_leads'] map to ['support','sales']
    expect(workflow?.settings?.targetDepartments).toEqual(
      expect.arrayContaining(['support', 'sales']),
    );
    expect(workflow?.settings?.hints).toEqual(payload.primaryObjectives);
  });
});
