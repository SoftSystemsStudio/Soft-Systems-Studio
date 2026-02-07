import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sendEmail, SendEmailParams, SendEmailResult } from '@/lib/email';

type ResponseData = {
  success?: boolean;
  id?: string;
  error?: string;
};

export async function POST(request: NextRequest) {
  // Require authentication
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Partial<SendEmailParams>;
    const { to, subject, html, text, replyTo } = body;

    // Validate required fields
    if (!to || !subject) {
      return NextResponse.json({ error: 'Missing required fields: to, subject' }, { status: 400 });
    }

    if (!html && !text) {
      return NextResponse.json({ error: 'Either html or text content is required' }, { status: 400 });
    }

    const result: SendEmailResult = await sendEmail({
      to,
      subject,
      html,
      text,
      replyTo,
    });

    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to send email',
      },
      { status: 500 },
    );
  }
}
