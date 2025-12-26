# Operations Runbook - Midwifery Client

## Daily Checks

- [ ] Verify n8n workflows are active and error-free.
- [ ] Check Vapi/Twilio logs for failed calls or quality issues.
- [ ] Review "Unclassified" calls in the dashboard to improve intent recognition.

## Incident Response

- **Scenario: AI Voice Service Down**
  1.  Check status page of provider (Vapi/OpenAI).
  2.  Failover: Redirect phone number to client's backup voicemail or answering service immediately via Twilio Console.
  3.  Notify client via email/SMS of temporary outage.
- **Scenario: Incorrect Booking**
  1.  Verify transcript.
  2.  Manually correct in Calendar.
  3.  Contact patient to confirm correct time.
  4.  Update prompt/rules to prevent recurrence.

## Maintenance

- **Weekly:** Review call summaries for quality assurance.
- **Monthly:** Update FAQ with new common questions.
