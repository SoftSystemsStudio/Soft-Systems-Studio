# Midwifery AI Voice Receptionist — Call Flows (MVP)

Client: Prattville Midwifery, LLC
Timezone: America/Chicago (Central Time)
Address: 210 Medical Center Dr, Prattville, AL 36066
Main Phone: 334-895-3705
Email (summaries): prattvillehomemidwifery@gmail.com

## Published clinic hours (baseline; configurable)

Source (site):

- Wednesday 1:00 pm–4:30 pm
- Thursday 1:00 pm–4:30 pm
- Friday 7:30 am–1:00 pm

> Note: Google listings may differ; agent must read hours from config, not hardcode.

---

## Positioning + scope boundaries

- The AI is a bilingual receptionist for intake, scheduling, FAQs, and message capture.
- The AI does not provide medical advice, diagnosis, or treatment plans.
- The AI can perform an urgency screen and route to on-call/human escalation.

---

## Language strategy (English/Spanish)

### Default behavior

1. Detect language from caller speech where feasible.
2. If uncertain within first 10 seconds, prompt:
   - EN: “Do you prefer English or Spanish?”
   - ES: “¿Prefiere inglés o español?”
3. Persist language preference for the session and include it in the call payload.

---

## Global opening script

### English

“Thanks for calling Prattville Midwifery. I’m the automated receptionist. I can help with scheduling, questions, or taking a message. If this is a medical emergency, please hang up and call 911. How can I help today?”

### Spanish

“Gracias por llamar a Prattville Midwifery. Soy la recepcionista automatizada. Puedo ayudar con citas, preguntas o tomar un mensaje. Si esto es una emergencia médica, por favor cuelgue y llame al 911. ¿En qué le puedo ayudar hoy?”

---

## Intent taxonomy (MVP)

1. Scheduling (book/reschedule/cancel)
2. New pregnancy inquiry / midwifery journey qualification
3. Existing patient message
4. Non-pregnant inquiry (general/gynecology/birth control/well-person)
5. Office info/FAQ (hours, address, services)
6. Urgent concern → escalation

---

## Flow 1 — Scheduling (Acuity baseline)

Scheduling appears to be handled via Acuity Scheduling.

### Goal

- If during business hours: offer to book or create a scheduling request.
- After hours: capture request + urgency screen + notify on-call if urgent.

### Steps

1. Confirm caller name + callback number.
2. Identify appointment category:
   - Consultations / Gynecology / Postpartum / Prenatal / Classes (as available in Acuity)
3. Determine action: book vs reschedule vs cancel.
4. If direct booking is enabled:
   - Offer available times (or propose 2–3 windows) and confirm.
5. If direct booking is not enabled:
   - Create “Scheduling Request” with category + preferred windows.
6. Confirm next step:
   - “We’ll confirm by phone/text during clinic hours.”

### Required capture fields

- Name, callback, language
- Appointment category
- Preferred date/time windows (at least 2)
- Reason for visit (high-level)

---

## Flow 2 — New pregnancy inquiry (primary funnel)

The website directs pregnant callers toward the Midwifery Journey Quiz.

### Goal

Route new pregnancy inquiries into the standardized qualification path + optionally send the quiz link via SMS.

### Steps

1. Confirm name + callback number.
2. Ask high-level qualifiers (non-clinical):
   - Estimated due date (or weeks pregnant)
   - Location (city/zip)
   - Care interest: home birth vs hospital birth vs not sure
3. Offer to text the quiz link:
   - “I can text you a quick questionnaire so the team can recommend the right next step.”
4. Create a “New Pregnancy Inquiry” record + notify staff.
5. If caller wants to speak to someone now:
   - If business hours: warm transfer to staff line.
   - If after-hours: take message + urgency screen.

---

## Flow 3 — Existing patient message

### Goal

Capture message with structured fields; route to staff email; escalate if urgent.

### Steps

1. Confirm name + date of birth (optional; only if client approves) + callback number.
2. Ask: “What’s the best way to help?” (message category)
3. Capture message summary, preferred callback time, urgency screen.
4. Send to staff email summary.

---

## Flow 4 — Non-pregnant inquiry (contact form alignment)

The website indicates the contact form is for NON-pregnant patients.

### Goal

Support non-pregnant inquiries (well-person exam, contraception, general questions), and drive scheduling.

### Steps

1. Confirm name + callback number.
2. Identify topic: well-person exam / contraception / general visit.
3. Offer scheduling (Acuity) or create scheduling request.
4. Provide FAQs as needed.

---

## Flow 5 — Office info/FAQ

### Provide

- Address: 210 Medical Center Dr, Prattville, AL 36066
- Clinic hours (config-driven; website baseline listed above)
- Services overview (high level; no medical guidance)

---

## Flow 6 — Urgency assessment + escalation

### Trigger

- Caller states urgent symptoms, severe pain, heavy bleeding, fainting, or newborn distress (English/Spanish keywords configured).
- Caller insists they need immediate clinical guidance.

### Action

1. Safety statement:
   - “I can’t provide medical advice. If this feels like an emergency, call 911 or go to the nearest emergency room.”
2. If after-hours and “urgent flag” true:
   - Forward/notify on-call midwife per escalation policy.
3. Create high-priority alert email to staff + on-call channel (future: SMS).

---

## End-of-call standard

- Confirm best callback number + timeframe.
- Confirm next step (“You’ll receive a call back during clinic hours”).
- Post call payload to automation layer (n8n webhook) for logging + email summary.
