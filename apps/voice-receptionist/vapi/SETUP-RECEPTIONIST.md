# Soft Systems Studio Receptionist - Vapi Setup

Get your AI receptionist live in ~10 minutes.

## Step 1: Create Assistant in Vapi

1. Go to [dashboard.vapi.ai](https://dashboard.vapi.ai)
2. Click **Assistants** → **Create Assistant** → **Blank**
3. Name it: `Soft Systems Studio Receptionist`

## Step 2: Configure the Assistant

Copy these settings from `receptionist-config.json`:

### Model Settings

- **Provider:** OpenAI
- **Model:** gpt-4o
- **Temperature:** 0.6
- **Max Tokens:** 200

### System Prompt

Copy the entire `systemPrompt` from the config file.

### First Message

```
Hey there, thanks for calling Soft Systems Studio! How can I help you today?
```

### Voice Settings

- **Provider:** ElevenLabs
- **Voice:** Jessica (or pick one you like from the voice library)
- **Model:** eleven_turbo_v2_5

### Transcriber

- **Provider:** Deepgram
- **Model:** nova-2
- **Language:** English

### Timing

- **Response Delay:** 0.4 seconds
- **Silence Timeout:** 20 seconds
- **Max Duration:** 600 seconds (10 min)

### Features

- **Backchanneling:** Enabled (adds natural "mhm", "uh-huh")
- **Background Sound:** Off

## Step 3: Get a Phone Number

1. Click **Phone Numbers** → **Buy Number**
2. Pick a US number (choose your preferred area code)
3. Assign it to your new assistant

## Step 4: Configure Webhook (Optional)

If you want call summaries sent somewhere:

1. Go to your assistant → **Advanced** → **Server URL**
2. Enter your webhook URL (n8n, Zapier, or custom endpoint)

The webhook receives:

- Call transcript
- Structured data (name, phone, scheduling request, etc.)
- Call summary

## Step 5: Test It

Call your new number and have a conversation!

Test scenarios:

- "Hi, I'm interested in your AI receptionist service"
- "Can I schedule a call for next Tuesday?"
- "How much does it cost?"

---

## Voice Alternatives

If Jessica doesn't sound right to you, try these in the Vapi voice picker:

| Voice | Style               |
| ----- | ------------------- |
| Aria  | Natural, friendly   |
| Sarah | Professional, clear |
| Emily | Soft, approachable  |

---

## Quick Troubleshooting

**AI sounds robotic:**

- Lower the stability setting (try 0.4)
- Increase similarity boost (try 0.85)

**Responses too slow:**

- Set `optimizeStreamingLatency` to 4 (faster but slightly lower quality)

**AI talks too much:**

- Reduce max tokens to 150
- Edit system prompt to emphasize "keep it brief"

---

## Files Reference

- `receptionist-config.json` - Full config (copy settings from here)
- `demo-assistant-config.json` - Outbound demo calls variant
- `webhook-transformer.js` - Transform Vapi payload to legacy format
