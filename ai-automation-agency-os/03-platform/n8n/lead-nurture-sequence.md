# Lead Nurture Email Sequence

## Overview

Automated email sequence for leads who fill out the intake form but don't immediately book a call. Goal: Stay top-of-mind, provide value, and convert to consultation.

---

## Sequence Structure

```
[Intake Form Submitted]
        ↓
   Email 1 (Immediate)
        ↓
      24 hours
        ↓
   Email 2 (Day 1)
        ↓
      3 days
        ↓
   Email 3 (Day 4)
        ↓
      4 days
        ↓
   Email 4 (Day 8)
        ↓
      7 days
        ↓
   Email 5 (Day 15)
        ↓
   [Move to Monthly Newsletter]
```

**Exit Conditions:**

- Books a consultation → Exit sequence, send booking confirmation
- Unsubscribes → Exit immediately
- Replies to any email → Alert team, consider direct outreach

---

## Email 1: Immediate Welcome

**Subject:** Got your inquiry, {{firstName}} — here's what's next

**Send:** Immediately after form submission

```
Hi {{firstName}},

Thanks for reaching out to Soft Systems Studio. We received your inquiry about {{service_interest}}.

Here's what happens next:

1. Our team reviews your submission (usually within a few hours)
2. If we think there's a fit, we'll reach out to schedule a discovery call
3. On the call, we'll learn about your needs and share how we might help

While you wait, here are a few resources that might be helpful:

→ Case Study: How a healthcare practice automated 70% of their phone calls
   [LINK]

→ FAQ: Common questions about AI automation for businesses
   [LINK]

If you'd rather jump straight to a conversation, you can book time directly:

[BOOK A 30-MIN DISCOVERY CALL]

Talk soon,

{{yourName}}
Soft Systems Studio

P.S. Reply to this email anytime — it comes straight to me.
```

---

## Email 2: Value-Add (Day 1)

**Subject:** The hidden cost of missed calls (quick math)

**Send:** 24 hours after Email 1

```
Hi {{firstName}},

Quick thought experiment:

If your business gets 50 calls/week and you miss 20% of them...
That's 10 missed calls per week.
520 per year.

If just 10% of those would've become customers worth $500 each...
That's $26,000 in lost revenue. Every year.

And that doesn't count:
- The frustrated customers who never call back
- The time your team spends returning voicemails
- The stress of wondering "what did I miss?"

This is exactly the problem our AI receptionist solves. It answers every call, 24/7, in English and Spanish.

One of our clients in healthcare went from answering 40% of calls to 100% — and reclaimed 6 hours per week that was previously spent on phone tag.

Worth a conversation?

[BOOK YOUR FREE DISCOVERY CALL]

Best,
{{yourName}}

P.S. We only take on a few new projects each month to ensure quality. If this is something you're serious about, don't wait too long.
```

---

## Email 3: Social Proof (Day 4)

**Subject:** "I was skeptical about AI handling patient calls..."

**Send:** 3 days after Email 2

```
Hi {{firstName}},

I hear this a lot: "AI sounds cool, but my business is different. It's too personal. Customers won't like it."

I get it. That's exactly what the owner of a midwifery practice told us.

Her concerns:
- Healthcare is deeply personal — would AI feel cold?
- Many patients speak Spanish — can AI really handle that?
- What about urgent situations — labor signs, emergencies?

Here's what happened after we deployed:

✓ Spanish-speaking patients started booking consultations (they'd been hanging up on voicemail before)

✓ An urgent call at 2am got properly escalated — something voicemail could never do

✓ She got 6+ hours/week back to focus on patient care

Her words: "The first time a Spanish-speaking patient booked at 10pm on a Saturday, I was sold."

Every business thinks they're different. Most of the time, the same patterns apply.

Curious if yours is truly different? Let's find out:

[SCHEDULE A DISCOVERY CALL]

— {{yourName}}
```

---

## Email 4: Objection Handling (Day 8)

**Subject:** 3 reasons people DON'T hire us (and why that might be good)

**Send:** 4 days after Email 3

```
Hi {{firstName}},

I want to be upfront about why we're NOT right for everyone.

**1. You need it yesterday**

Our process takes 4-6 weeks. We don't cut corners. If you need something live tomorrow, we're not your shop. (Though if you can wait, you'll get something built to last.)

**2. Budget under $5k**

Our minimum project is around $5,000. We're not the cheapest option. We're the "do it right the first time" option. If you're looking for a quick template or $500 solution, Fiverr is probably better.

**3. You want to manage it yourself**

We build things that work autonomously. Some people want to tinker and customize daily. We build "set it and forget it" systems with optional ongoing support.

---

Still here? That probably means:

- You value quality over speed
- You have budget for a real solution
- You want to free up time, not create more work

If that's you, let's talk:

[BOOK YOUR DISCOVERY CALL]

Cheers,
{{yourName}}

P.S. No pressure on these emails. If now isn't the right time, no worries. But our calendar fills up fast, so if you're ready, don't sleep on it.
```

---

## Email 5: Last Chance + Value (Day 15)

**Subject:** Last one from me (unless you reply)

**Send:** 7 days after Email 4

```
Hi {{firstName}},

This is my last automated email — I don't want to clutter your inbox.

But before I go, one more resource that might be useful:

**→ AI Automation ROI Calculator** [LINK]
   Plug in your numbers and see what automation could save you.

If you ever want to chat about:
- AI voice reception for your business
- Chat support automation
- Workflow automation to save time
- Custom web development

Just reply to this email. I read every one.

Wishing you all the best,
{{yourName}}

P.S. I'll add you to our monthly newsletter with tips on automation and AI. Feel free to unsubscribe anytime — no hard feelings.
```

---

## Booking Confirmation Email

**Subject:** You're booked! Here's what to prepare

**Send:** Immediately after booking

```
Hi {{firstName}},

Great news — you're on the calendar!

**Discovery Call Details:**
📅 {{appointment_date}} at {{appointment_time}} {{timezone}}
📞 I'll call you at {{phone_number}}
⏱️ About 30 minutes

**To make the most of our time, think about:**

1. What's your biggest operational headache right now?
2. What would "success" look like 6 months from now?
3. Any tools/systems you currently use (CRM, calendar, phone system)?

No need to prepare anything formal — just come ready to chat.

**Can't make it?**
[Reschedule] | [Cancel]

Looking forward to learning about your business!

{{yourName}}
Soft Systems Studio
```

---

## Post-Call Follow-Up (No Proposal Yet)

**Subject:** Great chatting — next steps inside

**Send:** 1 hour after call (manual trigger)

```
Hi {{firstName}},

Thanks for the conversation today! I enjoyed learning about {{business_name}} and the challenges you're facing with {{pain_point}}.

As discussed, here's what happens next:

1. I'll put together a custom proposal based on our conversation
2. You'll receive it by {{proposal_date}}
3. We'll schedule a follow-up to walk through it together

In the meantime, here's the case study I mentioned:
[RELEVANT CASE STUDY LINK]

Questions before then? Just reply.

Talk soon,
{{yourName}}
```

---

## Proposal Sent Follow-Up

**Subject:** Your custom proposal is ready

**Send:** With proposal attachment

```
Hi {{firstName}},

As promised, your custom proposal is attached.

**Quick summary:**
- Solution: {{package_name}}
- Investment: {{price}}
- Timeline: {{timeline}}

**What's inside:**
- Understanding of your needs (did I get it right?)
- Proposed solution and deliverables
- Investment breakdown
- Timeline and next steps

I'd love to walk you through it and answer any questions:

[BOOK PROPOSAL REVIEW CALL]

Or just reply with questions — happy to clarify anything.

{{yourName}}

P.S. This proposal is valid for 30 days. After that, pricing may change based on our availability.
```

---

## n8n Workflow Configuration

### Workflow: Lead Nurture Sequence

```json
{
  "name": "Lead Nurture Email Sequence",
  "nodes": [
    {
      "name": "Webhook - Intake Form",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "intake-form",
        "method": "POST"
      }
    },
    {
      "name": "Add to CRM",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "={{$env.CRM_API_URL}}/leads",
        "method": "POST"
      }
    },
    {
      "name": "Send Email 1",
      "type": "n8n-nodes-base.emailSend",
      "parameters": {
        "subject": "Got your inquiry, {{$json.firstName}} — here's what's next",
        "template": "email-1-welcome"
      }
    },
    {
      "name": "Wait 24h",
      "type": "n8n-nodes-base.wait",
      "parameters": {
        "amount": 24,
        "unit": "hours"
      }
    },
    {
      "name": "Check if Booked",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "={{$json.hasBookedCall}}",
              "value2": true
            }
          ]
        }
      }
    }
    // ... continues for remaining emails
  ]
}
```

---

## Metrics to Track

| Metric              | Target | Tool            |
| ------------------- | ------ | --------------- |
| Email Open Rate     | >40%   | Email provider  |
| Click-Through Rate  | >5%    | Email provider  |
| Reply Rate          | >2%    | Manual tracking |
| Sequence-to-Booking | >15%   | n8n + calendar  |
| Unsubscribe Rate    | <1%    | Email provider  |

---

## A/B Testing Ideas

1. **Subject Lines:** Question vs. statement vs. curiosity gap
2. **Send Times:** Morning vs. afternoon vs. evening
3. **Email Length:** Short (3 paragraphs) vs. detailed
4. **CTA Style:** Button vs. text link vs. calendar embed
5. **Social Proof Placement:** Email 2 vs. Email 3

---

_Email sequence v1.0 — January 2026_
