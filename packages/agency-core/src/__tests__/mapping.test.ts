import { buildClientConfigFromIntake } from '../mapping';
import type { IntakePayload } from '../configTypes';

describe('buildClientConfigFromIntake', () => {
  it('creates a ClientConfig from a representative IntakePayload', () => {
    const payload: IntakePayload = {
      companyName: 'Test Co',
      website: 'https://example.com',
      industry: 'SaaS',
      size: '11-50',
      primaryObjectives: ['reduce_support_volume', 'increase_leads'],
      systems: ['support', 'workflow'],
      dailyInquiries: '12',
      supportChannels: ['web_chat', 'email'],
      mainPainPoints: 'High ticket volume for repetitive questions',
      contactName: 'Jane Doe',
      contactEmail: 'jane@example.com',
      contactPhone: '+1 555 555 5555',
      notes: 'Please focus on automating first-touch triage',
    };

    const cfg = buildClientConfigFromIntake(payload);

    // clientId and timestamps
    expect(cfg.clientId).toBeDefined();
    expect(cfg.createdAt).toBeDefined();
    expect(cfg.updatedAt).toBeDefined();

    // Profile fields match
    expect(cfg.profile.companyName).toBe(payload.companyName);
    expect(cfg.profile.website).toBe(payload.website);
    expect(cfg.profile.industry).toBe(payload.industry);
    expect(cfg.profile.size).toBe(payload.size);

    // Contact fields
    expect(cfg.contact).toBeDefined();
    expect(cfg.contact?.name).toBe(payload.contactName);
    expect(cfg.contact?.email).toBe(payload.contactEmail);
    expect(cfg.contact?.phone).toBe(payload.contactPhone);

    // Subsystems: support_system
    const support = cfg.subsystems.find((s) => s.type === 'support_system');
    expect(support).toBeDefined();
    expect(support?.settings).toBeDefined();
    expect(support?.settings?.channels).toEqual(expect.arrayContaining(payload.supportChannels));
    expect(support?.settings?.estimatedDailyInquiries).toBe(Number(payload.dailyInquiries));

    // Subsystems: workflow_system
    const workflow = cfg.subsystems.find((s) => s.type === 'workflow_system');
    expect(workflow).toBeDefined();
    expect(workflow?.settings).toBeDefined();
    // Based on mapping rules, reduce_support_volume -> support, increase_leads -> sales
    expect(workflow?.settings?.targetDepartments).toEqual(
      expect.arrayContaining(['support', 'sales']),
    );
    expect(workflow?.settings?.hints).toEqual(payload.primaryObjectives);
  });
});
