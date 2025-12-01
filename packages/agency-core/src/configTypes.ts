export type Subsystem =
  | 'support_system'
  | 'content_system'
  | 'data_system'
  | 'workflow_system'
  | 'voice_system'
  | 'security_system';

export interface SubsystemConfig {
  id: string;
  type: Subsystem;
  description?: string;
  settings?: Record<string, unknown>;
}

export interface ClientContact {
  name?: string;
  email?: string;
  phone?: string;
}

export interface ClientProfile {
  companyName: string;
  website?: string;
  industry?: string;
  size?: string;
}

export interface ClientConfig {
  clientId: string;
  profile: ClientProfile;
  contact?: ClientContact;
  subsystems: SubsystemConfig[];
  createdAt?: string;
  updatedAt?: string;
}

export type Objective =
  | 'reduce_support_volume'
  | 'increase_leads'
  | 'increase_content_output'
  | 'improve_reporting'
  | 'automate_workflows'
  | 'reduce_missed_calls';

export type SystemInterest = 'support' | 'content' | 'data_bi' | 'workflow' | 'voice';

export type SupportChannel = 'email' | 'web_chat' | 'phone' | 'whatsapp' | 'sms' | 'social_dm';

export interface IntakePayload {
  // Step 1 – Company & Objectives
  companyName: string;
  website?: string;
  industry?: string;
  size?: string;
  primaryObjectives: Objective[];
  systems: SystemInterest[];

  // Step 2 – Tech stack
  websitePlatform?: string;
  crm?: string;
  helpdesk?: string;
  telephony?: string;
  calendar?: string;

  // Step 3 – Support & operations snapshot
  dailyInquiries?: string;
  supportChannels: SupportChannel[];
  mainPainPoints?: string;

  // Step 4 – Contact & notes
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;

  // Optional fields used by upstream systems
  clientId?: string;
}
