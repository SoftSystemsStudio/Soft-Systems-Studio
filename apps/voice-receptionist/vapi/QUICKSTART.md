# Vapi Quick Start - Get Running in 15 Minutes

## Step 1: Open Vapi Dashboard (2 min)

1. Go to https://dashboard.vapi.ai
2. Log in to your account

## Step 2: Create Assistant (5 min)

1. Click **"Assistants"** in the left sidebar
2. Click **"Create Assistant"** → **"Blank"**

3. Fill in **Basic Settings**:
   - **Name:** `Prattville Midwifery Receptionist`
   - **First Message:**
     ```
     Hello, thank you for calling Prattville Midwifery. How can I help you today?
     ```

4. Configure **Model** (scroll down):
   - **Provider:** `OpenAI`
   - **Model:** `gpt-4-turbo` (or `gpt-4o` for latest)
   - **Temperature:** `0.7`

5. Copy/paste this **System Prompt**:

```
You are a helpful, bilingual (English/Spanish) AI receptionist for Prattville Midwifery, LLC.
Your goal is to assist callers with scheduling, inquiries, and messages.

CORE RULES:
1. NO MEDICAL ADVICE. If a caller asks for medical advice, state that you cannot provide it and direct them to a medical professional or 911 for emergencies.
2. ALWAYS confirm the callback number.
3. NEVER promise actions not implemented. Instead say "I will pass this message to the staff".
4. MATCH the caller's language (English or Spanish).
5. Keep responses SHORT and conversational.

URGENCY - If caller mentions: severe pain, heavy bleeding, fainting, water broke, decreased fetal movement, newborn breathing trouble (or Spanish equivalents) - immediately tell them to hang up and call 911 or go to the ER.

Always end calls with: "Thank you for calling Prattville Midwifery. Someone will get back to you soon. Have a great day!"
```

6. Configure **Voice**:
   - **Provider:** `11labs`
   - **Voice ID:** `21m00Tcm4TlvDq8ikWAM` (Rachel - professional female)

7. Configure **Transcriber**:
   - **Provider:** `deepgram`
   - **Model:** `nova-2`
   - **Language:** `multi`

8. Click **"Save"** or **"Create"**

## Step 3: Buy Phone Number (3 min)

1. Click **"Phone Numbers"** in left sidebar
2. Click **"Buy a Number"**
3. Select:
   - **Country:** United States
   - **Area Code:** `334` (Alabama - near Prattville)
4. Click **"Buy"**
5. After purchase, click on the number
6. Set **"Assistant"** to your new `Prattville Midwifery Receptionist`
7. **Save**

## Step 4: Configure Webhook (3 min)

1. Go back to **"Assistants"** → click your assistant
2. Scroll to **"Advanced"** section
3. Find **"Server URL"**
4. Enter your n8n intake webhook URL:
   ```
   https://your-n8n-instance.com/webhook/xxxxx
   ```
5. **Save**

## Step 5: Test It! (2 min)

1. Call your new phone number
2. Say: "Hi, I'd like to schedule an appointment"
3. Verify the AI responds appropriately
4. Check that n8n received the webhook

---

## Your New Phone Number

After completing the steps above, your new number will be:

**+1 (334) XXX-XXXX** ← Write it here after purchase

---

## Webhook Payload

Vapi will send data to your n8n webhook. Add the transformer from `webhook-transformer.js` to convert it to your existing format.

Quick n8n setup:
1. Open your n8n intake workflow
2. Add a **"Code"** node right after the webhook trigger
3. Paste the contents of `webhook-transformer.js`
4. Connect it to your existing nodes

---

## Need Help?

- Vapi Docs: https://docs.vapi.ai
- Vapi Discord: https://discord.gg/vapi
- Your files are in: `apps/voice-receptionist/vapi/`
