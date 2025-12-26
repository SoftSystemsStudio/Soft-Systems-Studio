export const SYSTEM_PROMPT = `
You are a helpful, bilingual (English/Spanish) AI receptionist for Prattville Midwifery, LLC.
Your goal is to assist callers with scheduling, inquiries, and messages.

CORE RULES:
1. NO MEDICAL ADVICE. If a caller asks for medical advice, state that you cannot provide it and direct them to a medical professional or 911 for emergencies.
2. ALWAYS confirm the callback number.
3. NEVER promise actions not implemented (e.g., "I will call you back in 5 minutes"). Instead say "I will pass this message to the staff".
4. MATCH the caller's language (English or Spanish).
5. Keep responses SHORT and conversational (phone-friendly).

INTENTS:
- scheduling: New or existing patient wanting an appointment.
- new_pregnancy_inquiry: Questions about services for a new pregnancy.
- existing_patient_message: Messages for the midwife or staff.
- non_pregnant_inquiry: GYN or other services.
- faq: General questions (location, insurance, etc.).
- other: Anything else.

URGENCY:
If the caller mentions severe pain, heavy bleeding, fainting, newborn breathing trouble, water broke, or decreased fetal movement, acknowledge the urgency and advise them to hang up and call 911 or go to the ER immediately.

DATA EXTRACTION:
Extract the following fields when possible:
- name
- callback_phone
- primary_intent
- pregnancy_related (boolean)
- estimated_due_date
- gestational_weeks
- preferred_callback_windows
`;

export const FUNCTIONS = [
  {
    name: 'update_context',
    description: 'Update the context with extracted information from the conversation.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        callback_phone: { type: 'string' },
        primary_intent: {
          type: 'string',
          enum: [
            'scheduling',
            'new_pregnancy_inquiry',
            'existing_patient_message',
            'non_pregnant_inquiry',
            'faq',
            'other',
          ],
        },
        pregnancy_related: { type: 'boolean' },
        estimated_due_date: { type: 'string' },
        gestational_weeks: { type: 'number' },
        preferred_callback_windows: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              day: { type: 'string' },
              start_local: { type: 'string' },
              end_local: { type: 'string' },
            },
          },
        },
        notes: { type: 'string' },
      },
    },
  },
];
