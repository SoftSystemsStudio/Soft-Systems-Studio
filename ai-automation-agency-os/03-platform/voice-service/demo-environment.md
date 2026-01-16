# Demo Environment Setup

## Purpose

Allow prospects to experience the AI Voice Receptionist and Chat Agent before committing. This creates a "try before you buy" experience that builds confidence and accelerates sales.

---

## Demo Options

### Option 1: Live Demo Call Number

A dedicated phone number prospects can call to experience the voice receptionist.

**Setup:**

1. Provision a dedicated Twilio number for demos
2. Configure with generic "Soft Systems Demo" branding
3. Use a fictional business persona

### Option 2: Scheduled Demo Experience

Book a 15-minute "Experience the AI" session where we:

1. Call the prospect's phone FROM the AI
2. Walk them through a simulated scenario
3. Debrief and answer questions

### Option 3: Chat Widget Demo

Embed a demo chat agent on the website that prospects can interact with.

---

## Demo Voice Agent Configuration

### File: `demo-voice-config.ts`

```typescript
export const DEMO_CONFIG = {
  business: {
    name: 'Mountain View Family Dental',
    type: 'demo',
    timezone: 'America/Los_Angeles',
    hours: {
      monday: { open: '08:00', close: '17:00' },
      tuesday: { open: '08:00', close: '17:00' },
      wednesday: { open: '08:00', close: '17:00' },
      thursday: { open: '08:00', close: '17:00' },
      friday: { open: '08:00', close: '14:00' },
      saturday: null,
      sunday: null,
    },
    address: '123 Demo Street, Mountain View, CA 94041',
    phone: '+1-650-555-DEMO',
  },

  voice: {
    provider: 'elevenlabs',
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // Sarah - friendly female
    language: 'en',
    alternateLanguage: 'es',
  },

  capabilities: {
    scheduling: true,
    faq: true,
    messageCapture: true,
    escalation: false, // Disabled for demo
  },

  prompts: {
    greeting: {
      en: `Thanks for calling Mountain View Family Dental. This is an AI demo 
           from Soft Systems Studio. I can show you how I handle scheduling, 
           answer questions, and take messages. What would you like to try?`,
      es: `Gracias por llamar a Mountain View Family Dental. Esta es una 
           demostración de IA de Soft Systems Studio. Puedo mostrarle cómo 
           manejo las citas, respondo preguntas y tomo mensajes. 
           ¿Qué le gustaría probar?`,
    },
    closing: {
      en: `Thanks for trying our demo! If you'd like to see how this could work 
           for your business, visit softsystemsstudio.com or press 1 to 
           schedule a consultation. Have a great day!`,
      es: `¡Gracias por probar nuestra demostración! Si desea ver cómo esto 
           podría funcionar para su negocio, visite softsystemsstudio.com 
           o presione 1 para programar una consulta. ¡Que tenga un buen día!`,
    },
  },

  faq: [
    {
      question: 'What services do you offer?',
      answer: 'We offer general dentistry, cleanings, whitening, and cosmetic procedures.',
    },
    {
      question: 'Do you accept insurance?',
      answer: 'Yes, we accept most major dental insurance plans including Delta, Cigna, and Aetna.',
    },
    {
      question: 'What are your hours?',
      answer: "We're open Monday through Thursday 8am to 5pm, and Friday 8am to 2pm.",
    },
    {
      question: 'Do you offer emergency appointments?',
      answer: 'Yes, we reserve slots each day for dental emergencies. Let me know if you need one.',
    },
  ],

  demoScenarios: [
    {
      name: 'New Patient Scheduling',
      prompt: "I'd like to schedule a cleaning for next week",
      expectedFlow: ['availability check', 'time selection', 'contact capture', 'confirmation'],
    },
    {
      name: 'FAQ Handling',
      prompt: 'Do you accept my insurance?',
      expectedFlow: ['question recognition', 'knowledge retrieval', 'answer delivery'],
    },
    {
      name: 'Message Capture',
      prompt: 'Can you have Dr. Smith call me back?',
      expectedFlow: ['intent recognition', 'contact capture', 'callback promise', 'notification'],
    },
    {
      name: 'Language Switch',
      prompt: 'Hola, quisiera hacer una cita',
      expectedFlow: ['language detection', 'spanish response', 'maintain spanish'],
    },
  ],
};
```

---

## Twilio Demo Number Setup

### 1. Purchase Number

```bash
# Via Twilio CLI
twilio phone-numbers:buy:local --area-code=650 --voice-url=https://your-api.com/demo/voice
```

### 2. Configure Webhook

Point incoming calls to: `POST /api/demo/voice/incoming`

### 3. Environment Variables

```env
DEMO_TWILIO_NUMBER=+16505551234
DEMO_MODE=true
DEMO_ANALYTICS_ENABLED=true
```

---

## Demo Chat Widget Setup

### Embed Code for Website

```html
<!-- Soft Systems Demo Chat Widget -->
<script>
  window.SoftSystemsChat = {
    mode: 'demo',
    position: 'bottom-right',
    theme: 'dark',
    greeting:
      "Hi! I'm a demo of our AI chat agent. Ask me anything about our fictional dental practice!",
    businessContext: 'dental-demo',
  };
</script>
<script src="https://cdn.softsystemsstudio.com/chat-widget.js" async></script>
```

---

## Demo Analytics Tracking

Track demo interactions to understand prospect engagement:

```typescript
interface DemoAnalytics {
  sessionId: string;
  source: 'call' | 'chat' | 'scheduled';
  prospectInfo?: {
    email?: string;
    phone?: string;
    company?: string;
  };
  interactions: {
    timestamp: Date;
    type: 'greeting' | 'faq' | 'scheduling' | 'language_switch' | 'escalation_attempt';
    content: string;
    response: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
  }[];
  duration: number;
  convertedToLead: boolean;
  feedback?: string;
}
```

---

## Demo Landing Page Content

### URL: `/demo` or `/try-it`

**Headline:**  
"Experience AI Reception in 60 Seconds"

**Subhead:**  
"Call our demo line or chat with our AI — no signup required"

**CTA Buttons:**

1. "📞 Call Demo: +1-650-555-DEMO"
2. "💬 Try Chat Demo"
3. "📅 Book Guided Demo"

**What to Try:**

- Ask about appointment availability
- Request information about services
- Leave a message for callback
- Switch to Spanish mid-conversation

**After Demo CTA:**  
"Impressed? Let's discuss how this works for YOUR business."
[Book Free Consultation]

---

## Demo Script for Sales Calls

When walking a prospect through the demo:

> "I'm going to show you exactly what your customers would experience. I'll call your phone from our AI system. Just answer and interact naturally — try scheduling an appointment, asking a question, or even switching to Spanish if that's relevant for your business."

**After demo:**

> "What did you notice? ... [Let them respond] ... That's the experience your customers would have, 24/7, in their preferred language. Now imagine that instead of a fictional dental practice, it's trained on YOUR business, connected to YOUR calendar, and notifying YOUR team."

---

## Operational Checklist

### Before Going Live

- [ ] Demo Twilio number provisioned
- [ ] Demo voice agent configured and tested
- [ ] Demo chat widget deployed
- [ ] Analytics tracking verified
- [ ] Landing page created
- [ ] Team trained on demo walkthrough

### Ongoing Maintenance

- [ ] Weekly: Review demo analytics
- [ ] Monthly: Update demo FAQ based on prospect questions
- [ ] Quarterly: Refresh demo scenarios

---

## Success Metrics

| Metric                  | Target      |
| ----------------------- | ----------- |
| Demo-to-Lead Conversion | 30%+        |
| Average Demo Duration   | 2-5 minutes |
| Positive Feedback Rate  | 80%+        |
| Follow-up Call Booking  | 40%+        |

---

_Demo environment documentation v1.0 — January 2026_
