# Testing Checklist - Midwifery Client

## Functional Testing

- [ ] **Inbound Call:** Does the AI answer within 2 seconds?
- [ ] **Language Switch:** Does it switch to Spanish when greeted in Spanish?
- [ ] **Intent Recognition:**
  - [ ] "I want to book an appointment" -> Scheduling Flow
  - [ ] "I think I'm in labor" -> Escalation Flow
  - [ ] "Where are you located?" -> FAQ Flow
- [ ] **Escalation:** Does the transfer to the on-call mobile work?
- [ ] **Scheduling:**
  - [ ] Does it correctly identify available slots?
  - [ ] Does it block double-booking?
  - [ ] Is the calendar event created correctly?

## Integration Testing

- [ ] **CRM:** Is the new lead created in the CRM?
- [ ] **Notifications:** Did the Slack/SMS notification arrive?
- [ ] **Data:** Is the call summary and transcript logged?

## User Acceptance Testing (UAT)

- [ ] Client performs test calls.
- [ ] Client verifies calendar bookings.
- [ ] Client approves voice tone and persona.
