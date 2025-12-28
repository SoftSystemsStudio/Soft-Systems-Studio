# Voice Service Architecture

## Overview

This architecture describes the high-level components for the AI Voice Receptionist.

## Components

1.  **Telephony Provider (Twilio):**
    - Handles inbound/outbound PSTN calls.
    - Forwards media stream to Voice AI provider.

2.  **Voice AI Engine (Vapi / Bland AI):**
    - **STT (Speech-to-Text):** Transcribes user audio (Deepgram/Whisper).
    - **LLM (Brain):** Processes intent and generates response (GPT-4o / Claude 3.5).
    - **TTS (Text-to-Speech):** Synthesizes audio response (ElevenLabs).
    - **Orchestration:** Manages turn-taking and interruption handling.

3.  **Automation Layer (n8n):**
    - **Tool Calling:** The Voice AI calls n8n webhooks to perform actions (check calendar, save lead).
    - **Business Logic:** Executes rules defined in `call-flows.md`.
    - **Integrations:** Connects to CRM, Calendar, Slack.

## Data Flow

1.  **Call In:** Customer calls Twilio Number.
2.  **Stream:** Twilio streams audio to Vapi.
3.  **Process:** Vapi transcribes -> sends text to LLM.
4.  **Tool Call (Optional):** LLM decides it needs to "CheckAvailability".
    - Vapi sends request to n8n Webhook.
    - n8n queries Google Calendar.
    - n8n returns available slots to Vapi.
5.  **Response:** LLM generates text -> Vapi synthesizes audio -> Twilio plays audio to caller.
6.  **Post-Call:** Vapi sends call summary/transcript to n8n -> n8n updates CRM.
