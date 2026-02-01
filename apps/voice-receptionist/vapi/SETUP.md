# Vapi Voice Agent Setup Guide

This guide walks you through setting up the Prattville Midwifery voice receptionist on Vapi.ai as a replacement for Twilio.

## Prerequisites

- Vapi.ai account (https://vapi.ai)
- n8n webhook URLs for intake/scheduling/escalation
- (Optional) ElevenLabs API key for custom voice

## Quick Setup (Dashboard Method)

### Step 1: Create the Assistant

1. Log into [Vapi Dashboard](https://dashboard.vapi.ai)
2. Click **"Create Assistant"**
3. Choose **"Blank Assistant"**
4. Configure the following:

**Basic Settings:**

- **Name:** `Prattville Midwifery Receptionist`
- **First Message:** `Hello, thank you for calling Prattville Midwifery. How can I help you today?`

**Model:**

- **Provider:** OpenAI
- **Model:** `gpt-4-turbo`
- **Temperature:** 0.7

**System Prompt:** (copy from below)

```
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

URGENCY DETECTION:
If the caller mentions ANY of these phrases, immediately acknowledge the urgency and advise them to hang up and call 911 or go to the ER:
- English: severe pain, heavy bleeding, fainting, newborn breathing trouble, water broke, decreased fetal movement
- Spanish: dolor severo, sangrado abundante, desmayo, respiración del recién nacido, rompió fuente, disminución movimiento fetal

DATA EXTRACTION:
During the conversation, extract and remember:
- Caller's name
- Callback phone number (always confirm this)
- Primary intent (scheduling, inquiry, message, etc.)
- Whether pregnancy-related
- Estimated due date (if mentioned)
- Gestational weeks (if mentioned)
- Preferred callback times
- Any notes or messages for staff

CLOSING:
End calls with: "Thank you for calling Prattville Midwifery. Someone will get back to you soon. Have a great day!" or Spanish equivalent.
```

**Voice:**

- **Provider:** ElevenLabs
- **Voice:** Rachel (`21m00Tcm4TlvDq8ikWAM`) or choose a bilingual voice
- **Model:** `eleven_turbo_v2_5`

**Transcriber:**

- **Provider:** Deepgram
- **Model:** `nova-2`
- **Language:** `multi` (for English/Spanish)

### Step 2: Configure End-of-Call Webhook

1. In the assistant settings, go to **"Advanced"** → **"Server URL"**
2. Enter your n8n intake webhook URL
3. Enable **"Send end-of-call report"**

The webhook will receive a payload like:

```json
{
  "message": {
    "type": "end-of-call-report",
    "call": {
      "id": "call_xxx",
      "phoneNumber": "+1234567890",
      "startedAt": "2024-01-15T10:30:00Z",
      "endedAt": "2024-01-15T10:35:00Z"
    },
    "transcript": "...",
    "summary": "...",
    "analysis": {
      "structuredData": {
        "name": "Jane Doe",
        "callback_phone": "+1234567890",
        "primary_intent": "scheduling",
        "pregnancy_related": true,
        "urgency_detected": false
      }
    }
  }
}
```

### Step 3: Add a Phone Number

1. Go to **"Phone Numbers"** in the Vapi dashboard
2. Click **"Buy Number"**
3. Select a US number (area code near Prattville, AL: 334)
4. Assign it to your assistant

### Step 4: Test

1. Call the new phone number
2. Test in English and Spanish
3. Test urgency detection phrases
4. Verify webhook data arrives in n8n

---

## Programmatic Setup (API Method)

If you prefer to set up via API:

```bash
cd apps/voice-receptionist/vapi
VAPI_API_KEY=your_key N8N_INTAKE_WEBHOOK_URL=your_webhook npx ts-node setup-vapi.ts
```

---

## Webhook Payload Transformation

Your existing n8n workflows expect the old payload format. Here's how to transform Vapi's format:

**Vapi sends:**

```json
{
  "message": {
    "type": "end-of-call-report",
    "call": { ... },
    "analysis": {
      "structuredData": { ... }
    }
  }
}
```

**Your n8n expects:**

```json
{
  "schema_version": "1.0",
  "client": { ... },
  "call": { ... }
}
```

Add a transformation node in n8n at the start of your workflow. See `webhook-transformer.js` for the mapping logic.

---

## Environment Variables

Update your `.env` or deployment config:

```bash
# Remove Twilio vars (no longer needed)
# TWILIO_AUTH_TOKEN=xxx

# Add Vapi vars
VAPI_API_KEY=your_vapi_api_key
VAPI_ASSISTANT_ID=asst_xxx  # From setup output
VAPI_PHONE_NUMBER=+1334xxx  # Your new number
```

---

## Differences from Twilio Implementation

| Feature         | Twilio (old)                 | Vapi (new)               |
| --------------- | ---------------------------- | ------------------------ |
| Phone Numbers   | Twilio                       | Vapi (or bring your own) |
| Real-time Audio | WebSocket server required    | Handled by Vapi          |
| STT             | Twilio/Deepgram              | Deepgram (via Vapi)      |
| LLM             | Your server calls OpenAI     | Vapi calls OpenAI        |
| TTS             | Your server calls ElevenLabs | Vapi calls ElevenLabs    |
| Webhook         | Custom payload builder       | Vapi end-of-call report  |
| Server Required | Yes (voice-receptionist app) | No (serverless)          |

**Key Benefit:** No server infrastructure needed. Vapi handles everything.

---

## Troubleshooting

### Caller hears nothing

- Check the assistant's first message is set
- Verify the voice provider credentials

### Webhook not receiving data

- Verify the Server URL is correct
- Check n8n webhook is active and accessible
- Look at Vapi call logs for errors

### Wrong language responses

- Ensure transcriber language is set to `multi`
- Check the system prompt includes bilingual instructions

### Urgency not detected

- The LLM handles urgency detection via the system prompt
- Test with exact phrases: "I have severe pain"

---

## Soft Systems Studio Demo Assistant (Outbound Calls)

This assistant makes outbound demo calls when website visitors request a live AI demo.

### Step 1: Create the Demo Assistant

1. Go to **"Assistants"** → **"Create Assistant"** → **"Blank"**
2. **Name:** `Soft Systems Studio Demo Agent`
3. **First Message:** Leave blank (dynamically set per call)
4. **Model:** OpenAI `gpt-4-turbo`
5. **System Prompt:** Copy from `demo-assistant-config.json`
6. **Voice:** ElevenLabs - Adam (`pNInz6obpgDQGcFmaJgB`) or another professional voice

### Step 2: Get Your IDs

After creating the assistant:

1. Copy the **Assistant ID** (starts with `asst_`)
2. Go to **Phone Numbers** and copy the **Phone Number ID** (the number that will make outbound calls)

### Step 3: Configure Environment Variables

Add these to your frontend deployment (Vercel, etc.):

```bash
VAPI_API_KEY=your_vapi_api_key
VAPI_DEMO_ASSISTANT_ID=asst_xxx    # Demo assistant ID
VAPI_PHONE_NUMBER_ID=phn_xxx       # Phone number ID for outbound calls
```

### Step 4: Test

1. Go to your `/intake` page
2. Enter a name and phone number
3. Click **"Call Me Now"**
4. You should receive a call within 30 seconds

### How It Works

1. User fills in name + phone on `/intake` page
2. User clicks "Call Me Now"
3. Frontend calls `/api/demo-call` endpoint
4. Backend triggers Vapi outbound call via `POST https://api.vapi.ai/call/phone`
5. Vapi calls the user with personalized greeting
6. AI demonstrates voice capabilities and qualifies the lead

### Webhook for Demo Calls (Optional)

To receive end-of-call data for demo calls:

1. Set the assistant's Server URL to your n8n webhook
2. Create a workflow to handle demo call reports
3. Use the `analysis.structuredData` to update your CRM with lead qualification data

---

## Support

- Vapi Documentation: https://docs.vapi.ai
- Vapi Discord: https://discord.gg/vapi
