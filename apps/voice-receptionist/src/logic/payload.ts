import { UrgencyLevel } from './router';

export interface CallPayload {
  schema_version: string;
  client: {
    client_id: string;
    name: string;
    timezone: string;
  };
  call: {
    call_id: string;
    direction: string;
    started_at: string;
    ended_at: string;
    duration_seconds: number;
    language: {
      detected: string;
      confirmed: string;
      confidence: number;
    };
    caller: {
      phone_e164: string;
      name: string;
      callback_phone_e164: string;
    };
    routing: {
      business_hours: boolean;
      after_hours: boolean;
      clinic_hours_source: string;
      handoff_attempted: boolean;
      handoff_target: string;
      handoff_result: string;
    };
    intent: {
      primary: string;
      secondary: string;
      category: string;
    };
    urgency: {
      level: UrgencyLevel;
      trigger_phrases: string[];
      presented_911_directive: boolean;
    };
    intake: {
      pregnancy_related: boolean;
      estimated_due_date: string | null;
      gestational_weeks: number | null;
      care_interest: string;
      preferred_contact_method: string;
      preferred_callback_windows: any[];
      notes: string;
    };
    actions: {
      quiz_link_offered: boolean;
      quiz_link_sent: boolean;
      scheduling_requested: boolean;
      appointment_booked: boolean;
      appointment_details: any;
      message_taken: boolean;
    };
    artifacts: {
      transcript_available: boolean;
      call_summary: string;
      redactions_applied: boolean;
    };
  };
}

export type IntentLike = Partial<{
  name: string;
  callback_phone: string;
  primary: string;
  secondary: string;
  category: string;
  pregnancy_related: boolean;
  estimated_due_date: string | null;
  gestational_weeks: number | null;
  care_interest: string;
  preferred_contact_method: string;
  preferred_callback_windows: unknown[];
  notes: string;
  scheduling_requested: boolean;
}>;

export function buildPayload(
  callId: string,
  callerPhone: string,
  startTime: Date,
  endTime: Date,
  language: string,
  intent: IntentLike,
  urgency: UrgencyLevel,
  isBusinessHours: boolean,
  summary: string,
): CallPayload {
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

  return {
    schema_version: '1.0',
    client: {
      client_id: 'midwifery_prattville',
      name: 'Prattville Midwifery, LLC',
      timezone: 'America/Chicago',
    },
    call: {
      call_id: callId,
      direction: 'inbound',
      started_at: startTime.toISOString(),
      ended_at: endTime.toISOString(),
      duration_seconds: duration,
      language: {
        detected: language,
        confirmed: language,
        confidence: 1.0,
      },
      caller: {
        phone_e164: callerPhone,
        name: intent.name || 'Unknown',
        callback_phone_e164: intent.callback_phone || callerPhone,
      },
      routing: {
        business_hours: isBusinessHours,
        after_hours: !isBusinessHours,
        clinic_hours_source: 'config',
        handoff_attempted: false,
        handoff_target: 'none',
        handoff_result: 'not_applicable',
      },
      intent: {
        primary: intent.primary || 'other',
        secondary: intent.secondary || '',
        category: intent.category || 'unknown',
      },
      urgency: {
        level: urgency,
        trigger_phrases: [], // Populate if detected
        presented_911_directive: true, // Always true per requirements
      },
      intake: {
        pregnancy_related: intent.pregnancy_related || false,
        estimated_due_date: intent.estimated_due_date || null,
        gestational_weeks: intent.gestational_weeks || null,
        care_interest: intent.care_interest || 'not_applicable',
        preferred_contact_method: intent.preferred_contact_method || 'unknown',
        preferred_callback_windows: intent.preferred_callback_windows || [],
        notes: intent.notes || '',
      },
      actions: {
        quiz_link_offered: false,
        quiz_link_sent: false,
        scheduling_requested: intent.scheduling_requested || false,
        appointment_booked: false,
        appointment_details: {},
        message_taken: true,
      },
      artifacts: {
        transcript_available: false,
        call_summary: summary,
        redactions_applied: false,
      },
    },
  };
}
