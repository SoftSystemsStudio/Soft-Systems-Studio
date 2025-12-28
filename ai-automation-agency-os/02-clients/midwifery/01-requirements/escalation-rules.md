# Escalation Rules — Midwifery AI Voice Receptionist (MVP)

## Objectives

- Minimize risk by avoiding clinical advice.
- Provide fast routing to human/on-call when urgency indicators exist.
- Preserve an auditable trail (call summary + escalation reason).

## Safety disclaimer (always available)

EN: “I can’t provide medical advice. If you think this is an emergency, please hang up and call 911.”
ES: “No puedo dar consejos médicos. Si cree que es una emergencia, cuelgue y llame al 911.”

## Escalation tiers

### Tier 0 — Normal (no escalation)

- Scheduling
- General FAQs
- Routine messages

### Tier 1 — Priority callback (same/next business day)

Examples:

- Significant concern but not described as emergent
- Caller requests clinician follow-up
  Action:
- Mark `urgency.level = "priority_callback"`
- Notify staff email with subject prefix: `[PRIORITY CALLBACK]`

### Tier 2 — After-hours on-call escalation

Examples (caller-reported):

- “Severe pain”
- “Heavy bleeding”
- “I feel faint / passed out”
- “Decreased fetal movement”
- “Newborn trouble breathing / blue lips”
- “My water broke and I’m not sure”
  Spanish equivalents configured:
- “dolor intenso”
- “sangrado abundante”
- “me desmayé / mareo”
- “menos movimiento del bebé”
- “dificultad para respirar el bebé / labios azules”
- “se me rompió la fuente”
  Action:
- Mark `urgency.level = "on_call"`
- Immediate on-call notification pathway (initially email; future SMS/call)
- If caller indicates active emergency: instruct 911/ER first, then proceed with on-call notification.

### Tier 3 — Emergency redirect (911/ER)

Examples:

- Caller explicitly states emergency or life-threatening symptoms.
  Action:
- Provide 911 directive and end call quickly.
- Log event as `urgency.level = "emergency_redirect"`.

## After-hours policy (MVP)

- After-hours: receptionist focuses on (a) minor onboarding, (b) consultation requests, (c) urgency screen.
- If Tier 2 is triggered: route per on-call pathway.
- Otherwise: collect message + promise callback next clinic day.

## Audit requirements

Every escalation event must include:

- Timestamp
- Caller number (if available)
- Escalation tier + reason phrase
- Whether 911 directive was presented
- Whether on-call notification succeeded/failure (and retry status)
