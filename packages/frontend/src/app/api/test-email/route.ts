/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call -- false positives: ESLint cannot resolve @/ path aliases */
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = (await request.json()) as { email?: string };

    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    const result = await sendEmail({
      to: email,
      subject: 'Resend Test - Soft Systems Studio',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #c0ff6b;">Email Test Successful!</h1>
          <p>This is a test email from <strong>Soft Systems Studio</strong>.</p>
          <p>If you're reading this, Resend is configured correctly and working!</p>
          <hr style="border: none; border-top: 1px solid #333; margin: 24px 0;" />
          <p style="color: #666; font-size: 14px;">
            Sent at: ${new Date().toISOString()}
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      id: result.id,
      message: `Test email sent to ${email}`,
    });
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to send test email',
      },
      { status: 500 },
    );
  }
}
