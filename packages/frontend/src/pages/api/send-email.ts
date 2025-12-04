import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { sendEmail, SendEmailParams, SendEmailResult } from '../../lib/email';

type ResponseData = {
  success?: boolean;
  id?: string;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Require authentication
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const body = req.body as Partial<SendEmailParams>;
    const { to, subject, html, text, replyTo } = body;

    // Validate required fields
    if (!to || !subject) {
      return res.status(400).json({ error: 'Missing required fields: to, subject' });
    }

    if (!html && !text) {
      return res.status(400).json({ error: 'Either html or text content is required' });
    }

    const result: SendEmailResult = await sendEmail({
      to,
      subject,
      html,
      text,
      replyTo,
    });

    return res.status(200).json({ success: true, id: result.id });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to send email',
    });
  }
}
