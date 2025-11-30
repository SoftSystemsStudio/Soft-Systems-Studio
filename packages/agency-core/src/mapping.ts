import type { ClientConfig, IntakePayload } from './configTypes';

export function buildClientConfigFromIntake(raw: any): ClientConfig {
  // TODO: implement mapping from intake payload -> normalized config
  // The function should parse the incoming raw intake (form JSON),
  // extract company profile, contact, and map subsystem selections
  // into a normalized `ClientConfig` shape.

  // Minimal stubbed return to allow wiring. Replace with real mapping.
  const profile = {
    companyName: (raw?.companyName as string) ?? 'Unknown Company',
    website: raw?.website as string | undefined,
    industry: raw?.industry as string | undefined,
    size: raw?.size as string | undefined,
  };

  const subsystems =
    (raw?.subsystems as any[] | undefined)?.map((s, i) => ({
      id: String(s?.id ?? `sub-${i}`),
      type: (s?.type as any) ?? 'support_system',
      description: s?.description ?? undefined,
      settings: s?.settings ?? {},
    })) ?? [];

  return {
    clientId: String(raw?.clientId ?? `client-${Date.now()}`),
    profile,
    contact: raw?.contact ?? undefined,
    subsystems,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as ClientConfig;
}
