import type { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail } from '../../lib/email';

type ResponseData = {
  success?: boolean;
  id?: string;
  error?: string;
  message?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body as { email?: string };

    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    const result = await sendEmail({
      to: email,
      subject: '✅ Resend Test - Soft Systems Studio',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #c0ff6b;">🎉 Email Test Successful!</h1>
          <p>This is a test email from <strong>Soft Systems Studio</strong>.</p>
          <p>If you're reading this, Resend is configured correctly and working!</p>
          <hr style="border: none; border-top: 1px solid #333; margin: 24px 0;" />
          <p style="color: #666; font-size: 14px;">
            Sent at: ${new Date().toISOString()}
          </p>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      id: result.id,
      message: `Test email sent to ${email}`,
    });
  } catch (error) {
    console.error('Test email error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to send test email',
    });
  }
}
