import { NextRequest, NextResponse } from 'next/server';
import { getEnv } from '@/lib/env';

interface DemoCallRequest {
  name: string;
  phone: string;
  businessName?: string;
  businessType?: string;
}

interface VapiCallResponse {
  id: string;
  status: string;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  const env = getEnv();

  // Check for required Vapi configuration
  if (!env.VAPI_API_KEY || !env.VAPI_DEMO_ASSISTANT_ID || !env.VAPI_PHONE_NUMBER_ID) {
    console.error('Missing Vapi configuration');
    return NextResponse.json(
      {
        success: false,
        message: 'Demo calls are not configured. Please contact support.',
      },
      { status: 500 },
    );
  }

  // Validate request body
  const { name, phone, businessName, businessType } = (await request.json()) as DemoCallRequest;

  if (!name || !phone) {
    return NextResponse.json(
      {
        success: false,
        message: 'Name and phone number are required',
      },
      { status: 400 },
    );
  }

  // Validate phone number format (basic validation)
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length < 10 || cleanPhone.length > 15) {
    return NextResponse.json(
      {
        success: false,
        message: 'Please provide a valid phone number',
      },
      { status: 400 },
    );
  }

  // Format phone number for Vapi (E.164 format)
  const formattedPhone = cleanPhone.startsWith('1') ? `+${cleanPhone}` : `+1${cleanPhone}`;

  try {
    // Build the first message with personalization - keep it SHORT for natural conversation
    const firstMessage = `Hello, is this ${name}?`;

    // Create outbound call via Vapi API
    const response = await fetch('https://api.vapi.ai/call/phone', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assistantId: env.VAPI_DEMO_ASSISTANT_ID,
        phoneNumberId: env.VAPI_PHONE_NUMBER_ID,
        customer: {
          number: formattedPhone,
          name: name,
        },
        assistantOverrides: {
          firstMessage: firstMessage,
          systemPrompt: `YOU ARE GIVING A DEMO CALL. This is NOT a normal receptionist call.

The person you're calling is ${name}. They just requested a demo from the Soft Systems Studio website 30 seconds ago. 

YOUR ONLY JOB: Demonstrate what the AI receptionist sounds like and answer questions about the service. You are NOT taking appointments, NOT scheduling anything, NOT acting as their receptionist.

After they confirm their identity, say:
"Hi! I'm calling from Soft Systems Studio. You just requested a demo of our AI receptionist on the website - I'm the AI calling you right now. This is what the service sounds like. Pretty natural, right?"

Then have a natural conversation:
- Ask what kind of business they run
- Ask if they miss calls when they're busy
- Answer questions about the AI receptionist service (pricing, features, setup)
- Be conversational and natural
- DON'T try to schedule appointments
- DON'T act like you're their receptionist
- DO demonstrate how natural you sound
- DO offer to have our team reach out with a quote

Pricing if asked: $997 setup + $197/mo + usage ($30-80/mo typically)

End by offering to have our team reach out with a formal quote.`,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vapi API error:', response.status, errorText);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to initiate demo call. Please try again.',
        },
        { status: 500 },
      );
    }

    const callData = (await response.json()) as VapiCallResponse;

    console.log('Demo call initiated:', {
      callId: callData.id,
      phone: formattedPhone,
      name,
      businessName,
    });

    return NextResponse.json({
      success: true,
      message: 'Demo call initiated! You should receive a call within 30 seconds.',
      callId: callData.id,
    });
  } catch (error) {
    console.error('Error initiating demo call:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred. Please try again later.',
      },
      { status: 500 },
    );
  }
}
