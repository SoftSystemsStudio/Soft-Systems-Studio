import { NextRequest, NextResponse } from 'next/server';
import { getEnv } from '@/lib/env';

export async function GET(request: NextRequest) {
  const env = getEnv();

  return NextResponse.json({
    hasApiKey: !!env.VAPI_API_KEY,
    apiKeyPrefix: env.VAPI_API_KEY ? env.VAPI_API_KEY.substring(0, 10) + '...' : 'NOT SET',
    assistantId: env.VAPI_DEMO_ASSISTANT_ID || 'NOT SET',
    phoneNumberId: env.VAPI_PHONE_NUMBER_ID || 'NOT SET',
    expectedAssistantId: 'e3b2314b-dad6-4e03-adfb-844e0228aefb',
    expectedPhoneNumberId: '6b7a9f8d-8a31-4f19-8dc8-8c5d3abab278',
    match: {
      assistant: env.VAPI_DEMO_ASSISTANT_ID === 'e3b2314b-dad6-4e03-adfb-844e0228aefb',
      phone: env.VAPI_PHONE_NUMBER_ID === '6b7a9f8d-8a31-4f19-8dc8-8c5d3abab278',
    },
  });
}
