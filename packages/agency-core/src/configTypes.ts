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

export type IntakePayload = Record<string, unknown>;
