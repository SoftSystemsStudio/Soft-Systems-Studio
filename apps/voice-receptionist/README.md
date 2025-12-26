# Voice Receptionist

Bilingual AI Voice Receptionist for Prattville Midwifery, LLC.

## Setup

1.  **Install Dependencies**:

    ```bash
    pnpm install
    ```

2.  **Environment Variables**:
    Copy `.env.example` to `.env` and fill in the required values.

    ```bash
    cp .env.example .env
    ```

3.  **Local Development**:
    Start the server:

    ```bash
    pnpm dev
    ```

    Start the tunnel (in a separate terminal):

    ```bash
    pnpm tunnel
    ```

    _Note: Copy the HTTPS URL from the tunnel output (e.g., `https://abcd-1234.ngrok.io`) and update `PUBLIC_BASE_URL` and `WS_URL` in your `.env` file._
    - `PUBLIC_BASE_URL=https://abcd-1234.ngrok.io`
    - `WS_URL=wss://abcd-1234.ngrok.io/ws`

## Architecture

- **Framework**: Fastify + WebSocket
- **AI**: OpenAI (GPT-4 Turbo)
- **Voice**: Twilio ConversationRelay + ElevenLabs
- **Logic**: `src/logic/router.ts` (Urgency/Business Hours)

## Webhooks

The service sends payloads to n8n:

- `N8N_INTAKE_WEBHOOK_URL`: End of call
- `N8N_SCHEDULING_WEBHOOK_URL`: When scheduling is requested
- `N8N_ESCALATION_WEBHOOK_URL`: Immediate urgency detection
