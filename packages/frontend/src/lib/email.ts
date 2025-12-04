import { Resend, CreateEmailOptions } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

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
  from = process.env.RESEND_FROM_EMAIL || 'Soft Systems Studio <noreply@softsystems.studio>',
  replyTo,
}: SendEmailParams): Promise<SendEmailResult> {
  if (!process.env.RESEND_API_KEY) {
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

  const { data, error } = await resend.emails.send(emailOptions);

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

/**
 * Send intake submission notification to admin
 */
export async function sendIntakeNotification(
  adminEmail: string,
  clientData: { companyName: string; email: string; website?: string },
) {
  return sendEmail({
    to: adminEmail,
    subject: `New Intake: ${clientData.companyName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #c0ff6b;">New Client Intake</h1>
        <p>A new client has submitted the intake form:</p>
        <ul>
          <li><strong>Company:</strong> ${clientData.companyName}</li>
          <li><strong>Email:</strong> ${clientData.email}</li>
          ${clientData.website ? `<li><strong>Website:</strong> ${clientData.website}</li>` : ''}
        </ul>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/admin/clients" style="color: #c0ff6b;">View in Dashboard →</a></p>
      </div>
    `,
  });
}

export { resend };
