import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import env from '@/lib/env';

type IntakeFormData = {
  name: string;
  businessName: string;
  email: string;
  phone: string;
  businessType: string;
  serviceInterest: 'website' | 'ai_receptionist' | 'complete_package';
  monthlyCallVolume: string;
  biggestChallenge: string;
  howDidYouHear: string;
};

const SERVICE_LABELS: Record<string, string> = {
  website: 'Website Only ($2,500)',
  ai_receptionist: 'AI Receptionist ($997 + $197/mo)',
  complete_package: 'Complete Package ($2,997 + $197/mo)',
};

const PAYMENT_LINKS: Record<string, { url: string; deposit: string }> = {
  website: {
    url: 'https://buy.stripe.com/28E28rbSI6TwgJl70nfnO00',
    deposit: '$1,250',
  },
  ai_receptionist: {
    url: 'https://buy.stripe.com/fZufZh8Gwb9M78L4SffnO01',
    deposit: '$997',
  },
  complete_package: {
    url: 'https://buy.stripe.com/5kQ7sLe0Q5Ps9gT1G3fnO02',
    deposit: '$1,499',
  },
};

export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as IntakeFormData;

    if (!data.name || !data.businessName || !data.email || !data.phone || !data.serviceInterest) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const adminEmail = env.ADMIN_EMAIL || env.RESEND_FROM_EMAIL || 'admin@softsystems.studio';

    await sendEmail({
      to: adminEmail,
      subject: `New Lead: ${data.businessName} - ${SERVICE_LABELS[data.serviceInterest] || data.serviceInterest}`,
      html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 32px; border-radius: 12px;">
        <h1 style="color: #a855f7; margin-bottom: 24px; font-size: 24px;">New Lead Received!</h1>
        <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #fff; font-size: 18px; margin: 0 0 16px 0;">Contact Information</h2>
          <p style="margin: 8px 0; color: #d1d5db;"><strong style="color: #fff;">Name:</strong> ${data.name}</p>
          <p style="margin: 8px 0; color: #d1d5db;"><strong style="color: #fff;">Business:</strong> ${data.businessName}</p>
          <p style="margin: 8px 0; color: #d1d5db;"><strong style="color: #fff;">Email:</strong> <a href="mailto:${data.email}" style="color: #a855f7;">${data.email}</a></p>
          <p style="margin: 8px 0; color: #d1d5db;"><strong style="color: #fff;">Phone:</strong> <a href="tel:${data.phone}" style="color: #a855f7;">${data.phone}</a></p>
        </div>
        <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #fff; font-size: 18px; margin: 0 0 16px 0;">Business Details</h2>
          <p style="margin: 8px 0; color: #d1d5db;"><strong style="color: #fff;">Industry:</strong> ${data.businessType || 'Not specified'}</p>
          <p style="margin: 8px 0; color: #d1d5db;"><strong style="color: #fff;">Call Volume:</strong> ${data.monthlyCallVolume || 'Not specified'}</p>
          <p style="margin: 8px 0; color: #d1d5db;"><strong style="color: #fff;">How they heard about us:</strong> ${data.howDidYouHear || 'Not specified'}</p>
        </div>
        <div style="background: rgba(168, 85, 247, 0.1); padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid rgba(168, 85, 247, 0.3);">
          <h2 style="color: #a855f7; font-size: 18px; margin: 0 0 8px 0;">Interested In</h2>
          <p style="margin: 0; color: #fff; font-size: 20px; font-weight: bold;">${SERVICE_LABELS[data.serviceInterest] || data.serviceInterest}</p>
        </div>
        ${data.biggestChallenge ? `<div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin-bottom: 20px;"><h2 style="color: #fff; font-size: 18px; margin: 0 0 16px 0;">Their Biggest Challenge</h2><p style="margin: 0; color: #d1d5db; line-height: 1.6;">${data.biggestChallenge}</p></div>` : ''}
        ${PAYMENT_LINKS[data.serviceInterest]?.url !== 'REPLACE_WITH_STRIPE_LINK' ? `<div style="background: rgba(34, 197, 94, 0.1); padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid rgba(34, 197, 94, 0.3);"><h2 style="color: #22c55e; font-size: 16px; margin: 0 0 12px 0;">Payment Link (${PAYMENT_LINKS[data.serviceInterest].deposit} deposit)</h2><a href="${PAYMENT_LINKS[data.serviceInterest].url}" style="color: #22c55e; word-break: break-all;">${PAYMENT_LINKS[data.serviceInterest].url}</a></div>` : ''}
        <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1);"><p style="color: #9ca3af; font-size: 14px; margin: 0;">Reply to this lead within 24 hours. Call them if possible - they're expecting it!</p></div>
      </div>`,
      replyTo: data.email,
    });

    await sendEmail({
      to: data.email,
      subject: `Thanks for reaching out, ${data.name.split(' ')[0]}! - Soft Systems Studio`,
      html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 32px; border-radius: 12px;">
        <h1 style="color: #fff; margin-bottom: 16px; font-size: 24px;">We got your request!</h1>
        <p style="color: #d1d5db; line-height: 1.6; margin-bottom: 24px;">Hi ${data.name.split(' ')[0]},</p>
        <p style="color: #d1d5db; line-height: 1.6; margin-bottom: 24px;">Thanks for reaching out about ${SERVICE_LABELS[data.serviceInterest]?.toLowerCase() || 'our services'} for <strong style="color: #fff;">${data.businessName}</strong>.</p>
        <p style="color: #d1d5db; line-height: 1.6; margin-bottom: 24px;">We'll review your information and get back to you within <strong style="color: #a855f7;">24 hours</strong> to schedule a quick call and discuss your project.</p>
        ${PAYMENT_LINKS[data.serviceInterest]?.url !== 'REPLACE_WITH_STRIPE_LINK' ? `<div style="background: rgba(168, 85, 247, 0.15); padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid rgba(168, 85, 247, 0.4); text-align: center;"><p style="margin: 0 0 16px 0; color: #fff; font-size: 16px; font-weight: bold;">Ready to get started right away?</p><p style="margin: 0 0 20px 0; color: #d1d5db; font-size: 14px;">Secure your spot with a ${PAYMENT_LINKS[data.serviceInterest].deposit} deposit and we'll begin work immediately.</p><a href="${PAYMENT_LINKS[data.serviceInterest].url}" style="display: inline-block; background: #a855f7; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Pay Deposit Now</a><p style="margin: 16px 0 0 0; color: #9ca3af; font-size: 12px;">Secure payment via Stripe</p></div>` : ''}
        <div style="background: rgba(168, 85, 247, 0.1); padding: 20px; border-radius: 8px; margin: 24px 0; border: 1px solid rgba(168, 85, 247, 0.3);"><p style="margin: 0; color: #d1d5db; font-size: 14px;"><strong style="color: #fff;">What happens next?</strong><br/>We'll call or email you to schedule a 15-minute discovery call. No pressure, no hard sells — just a conversation to see if we're a good fit.</p></div>
        <p style="color: #d1d5db; line-height: 1.6; margin-bottom: 8px;">Talk soon,</p>
        <p style="color: #fff; font-weight: bold; margin: 0;">The Soft Systems Studio Team</p>
        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1);"><p style="color: #6b7280; font-size: 12px; margin: 0;">Questions? Just reply to this email.</p></div>
      </div>`,
      replyTo: env.ADMIN_EMAIL || 'softsystemstudioco@gmail.com',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Intake submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit. Please try again or email us directly.' },
      { status: 500 },
    );
  }
}
