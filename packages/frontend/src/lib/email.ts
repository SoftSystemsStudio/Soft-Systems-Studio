import { Resend, CreateEmailOptions } from 'resend';
import env from './env';

// Lazy-initialize Resend client (avoids crash when RESEND_API_KEY is missing at build time)
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(env.RESEND_API_KEY);
  }
  return _resend;
}

export type SendEmailParams = {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
};

export type SendEmailResult = {
  id: string;
};

/**
 * Send an email using Resend
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = env.RESEND_FROM_EMAIL || 'Soft Systems Studio <noreply@softsystems.studio>',
  replyTo,
}: SendEmailParams): Promise<SendEmailResult> {
  if (!env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured');
    throw new Error('Email service not configured');
  }

  // Build the email options
  const emailOptions = {
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    html: html || '',
    text,
    replyTo,
  } as CreateEmailOptions;

  const { data, error } = await getResend().emails.send(emailOptions);

  if (error) {
    console.error('Failed to send email:', error);
    throw new Error(error.message);
  }

  return { id: data?.id || '' };
}

/**
 * Send a welcome email to new users
 */
export async function sendWelcomeEmail(email: string, name?: string) {
  return sendEmail({
    to: email,
    subject: 'Welcome to Soft Systems Studio',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #c0ff6b;">Welcome${name ? `, ${name}` : ''}!</h1>
        <p>Thanks for signing up for Soft Systems Studio.</p>
        <p>We're excited to help you automate smarter and grow faster with AI-powered systems.</p>
        <hr style="border: none; border-top: 1px solid #333; margin: 24px 0;" />
        <p style="color: #666; font-size: 14px;">
          If you have any questions, just reply to this email.
        </p>
      </div>
    `,
  });
}

export { getResend as resend };
