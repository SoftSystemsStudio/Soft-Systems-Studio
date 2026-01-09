/**
 * Estimate Controller
 * Handles project estimate requests from website visitors
 * Integrates with Claude API for personalized recommendations
 */
import type { Request, Response } from 'express';
import { logger } from '../logger';
import db from '../db';
import Anthropic from '@anthropic-ai/sdk';
import env from '../env';

export interface EstimateRequest {
  email: string;
  projectType: 'website' | 'ai-automation' | 'both';
  timeline?: 'urgent' | 'normal' | 'flexible';
  features: string[];
  budget?: 'under-5k' | '5k-10k' | '10k-20k' | 'over-20k';
}

interface EstimateCalculation {
  min: number;
  max: number;
  weeks: string;
}

const BASE_ESTIMATES: Record<string, EstimateCalculation> = {
  website: { min: 3500, max: 8000, weeks: '3-6' },
  'ai-automation': { min: 5000, max: 12000, weeks: '4-8' },
  both: { min: 8000, max: 18000, weeks: '6-10' },
};

/**
 * Calculate estimate based on project parameters
 */
function calculateEstimate(data: EstimateRequest): EstimateCalculation {
  // Get base estimate, defaulting to website if project type is invalid
  const projectType: 'website' | 'ai-automation' | 'both' = [
    'website',
    'ai-automation',
    'both',
  ].includes(data.projectType)
    ? (data.projectType as 'website' | 'ai-automation' | 'both')
    : 'website';
  const base = BASE_ESTIMATES[projectType];

  // Feature multiplier: +10% per feature
  const featureMultiplier = 1 + (data.features?.length || 0) * 0.1;

  // Timeline multiplier: urgent adds 20%, flexible reduces 10%
  let timelineMultiplier = 1;
  if (data.timeline === 'urgent') {
    timelineMultiplier = 1.2;
  } else if (data.timeline === 'flexible') {
    timelineMultiplier = 0.9;
  }

  const min = Math.round(base!.min * featureMultiplier * timelineMultiplier);
  const max = Math.round(base!.max * featureMultiplier * timelineMultiplier);

  return { min, max, weeks: base!.weeks };
}

/**
 * Generate AI recommendations using Claude
 */
async function generateAIRecommendations(data: EstimateRequest): Promise<{
  recommendations: string;
  analysis: string;
}> {
  const anthropic = new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY,
  });

  const prompt = `You are a senior technical consultant for Soft Systems Studio, a company specializing in AI automation and web design.

A potential client has requested a project estimate with the following details:

Project Type: ${data.projectType === 'both' ? 'Website + AI Automation' : data.projectType === 'ai-automation' ? 'AI Automation' : 'Website Design'}
Timeline: ${data.timeline || 'Not specified'}
Budget Range: ${data.budget || 'Not specified'}
Selected Features:
${data.features.length > 0 ? data.features.map((f) => `- ${f}`).join('\n') : '- None specified (default features only)'}

Please provide:

1. **Personalized Recommendations** (2-3 paragraphs):
   - Suggest specific features or approaches that would benefit their project
   - Recommend an implementation strategy based on their timeline
   - Suggest any additional features they might have missed

2. **Technical Analysis** (1-2 paragraphs):
   - Brief technical approach for their specific combination of requirements
   - Any technical considerations they should be aware of
   - Estimated complexity and key milestones

Keep the tone professional, friendly, and consultative. Focus on value and outcomes, not just technology.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const response = message.content[0];
    const fullText = response && response.type === 'text' ? response.text : '';

    // Split into recommendations and analysis
    const sections = fullText.split(/\*\*Technical Analysis\*\*/i);
    const recommendations = (sections[0] || '')
      .replace(/\*\*Personalized Recommendations\*\*/i, '')
      .trim();
    const analysis = sections[1] ? sections[1].trim() : recommendations;

    return {
      recommendations:
        recommendations || 'Custom recommendations will be provided during your discovery call.',
      analysis: analysis || 'Technical details will be discussed during your consultation.',
    };
  } catch (error) {
    logger.error({ error }, 'Failed to generate AI recommendations');
    // Return fallback content if Claude API fails
    return {
      recommendations:
        'Our team will provide personalized recommendations during your free discovery call.',
      analysis:
        "We'll discuss the technical approach and implementation strategy in detail during your consultation.",
    };
  }
}

/**
 * Send estimate email to client
 */
async function sendEstimateEmail(
  email: string,
  estimate: EstimateCalculation,
  aiContent: { recommendations: string; analysis: string },
  projectData: EstimateRequest,
): Promise<void> {
  // Use Resend API directly
  const Resend = (await import('resend')).Resend;
  const resend = new Resend(env.RESEND_API_KEY);

  const projectTypeName =
    projectData.projectType === 'both'
      ? 'Website + AI Automation'
      : projectData.projectType === 'ai-automation'
        ? 'AI Automation'
        : 'Website Design';

  const featuresHtml =
    projectData.features.length > 0
      ? projectData.features.map((f) => `<li>${f}</li>`).join('')
      : '<li>Custom design</li><li>Mobile responsive</li><li>SEO optimized</li>';

  await resend.emails.send({
    from: env.RESEND_FROM_EMAIL || 'Soft Systems Studio <noreply@softsystems.studio>',
    to: email,
    subject: `Your Custom ${projectTypeName} Estimate - Soft Systems Studio`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 32px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #c0ff6b; margin: 0;">Your Project Estimate</h1>
          <p style="color: #999; margin-top: 8px;">Thank you for your interest in Soft Systems Studio</p>
        </div>

        <div style="background: linear-gradient(135deg, rgba(192, 255, 107, 0.1), rgba(34, 211, 238, 0.1)); padding: 24px; border-radius: 8px; border: 1px solid rgba(192, 255, 107, 0.2); margin-bottom: 32px;">
          <div style="text-align: center;">
            <div style="color: #c0ff6b; font-size: 36px; font-weight: bold; margin-bottom: 8px;">
              $${estimate.min.toLocaleString()} - $${estimate.max.toLocaleString()}
            </div>
            <div style="color: #ccc; font-size: 14px;">
              Estimated Timeline: ${estimate.weeks} weeks
            </div>
          </div>
        </div>

        <div style="margin-bottom: 32px;">
          <h2 style="color: #c0ff6b; font-size: 20px; margin-bottom: 16px;">Project Details</h2>
          <div style="color: #ccc;">
            <p><strong>Project Type:</strong> ${projectTypeName}</p>
            <p><strong>Selected Features:</strong></p>
            <ul style="color: #ccc; padding-left: 20px;">
              ${featuresHtml}
            </ul>
          </div>
        </div>

        <div style="margin-bottom: 32px;">
          <h2 style="color: #c0ff6b; font-size: 20px; margin-bottom: 16px;">Our Recommendations</h2>
          <div style="color: #ccc; line-height: 1.6;">
            ${aiContent.recommendations
              .split('\n')
              .map((p) => `<p>${p}</p>`)
              .join('')}
          </div>
        </div>

        <div style="margin-bottom: 32px;">
          <h2 style="color: #c0ff6b; font-size: 20px; margin-bottom: 16px;">Technical Approach</h2>
          <div style="color: #ccc; line-height: 1.6;">
            ${aiContent.analysis
              .split('\n')
              .map((p) => `<p>${p}</p>`)
              .join('')}
          </div>
        </div>

        <div style="border-top: 1px solid #333; padding-top: 24px; margin-bottom: 24px;">
          <h3 style="color: #fff; margin-bottom: 16px;">Next Steps:</h3>
          <ol style="color: #ccc; padding-left: 20px; line-height: 1.8;">
            <li>Schedule a free discovery call to discuss your project in detail</li>
            <li>Receive a detailed proposal with timeline and payment structure</li>
            <li>Begin development within 1 week of contract signing</li>
          </ol>
        </div>

        <div style="text-align: center; margin-top: 32px;">
          <a href="https://softsystemsstudiollc.com/intake" style="display: inline-block; background: #c0ff6b; color: #000; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Schedule Your Free Discovery Call →
          </a>
        </div>

        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #333; text-align: center;">
          <p style="color: #666; font-size: 12px; margin: 8px 0;">
            <strong style="color: #c0ff6b;">30-Day Money-Back Guarantee</strong><br />
            If you're not completely satisfied with our work within the first 30 days, we'll refund your investment. No questions asked.
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 16px;">
            Questions? Just reply to this email or call us at your convenience.
          </p>
        </div>
      </div>
    `,
    replyTo: 'hello@softsystems.studio',
  });
}

/**
 * Send admin notification
 */
async function sendAdminNotification(
  estimate: EstimateCalculation,
  data: EstimateRequest,
  estimateId: string,
): Promise<void> {
  const Resend = (await import('resend')).Resend;
  const resend = new Resend(env.RESEND_API_KEY);

  const projectTypeName =
    data.projectType === 'both'
      ? 'Website + AI Automation'
      : data.projectType === 'ai-automation'
        ? 'AI Automation'
        : 'Website Design';

  await resend.emails.send({
    from: env.RESEND_FROM_EMAIL || 'Soft Systems Studio <noreply@softsystems.studio>',
    to: env.ADMIN_EMAIL || 'hello@softsystems.studio',
    subject: `🎯 New Estimate Request: $${estimate.min.toLocaleString()} - $${estimate.max.toLocaleString()}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #c0ff6b;">New Project Estimate Request</h1>

        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h2 style="margin-top: 0;">Contact Info</h2>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Estimate Range:</strong> $${estimate.min.toLocaleString()} - $${estimate.max.toLocaleString()}</p>
          <p><strong>Timeline:</strong> ${estimate.weeks} weeks</p>
        </div>

        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h2 style="margin-top: 0;">Project Details</h2>
          <p><strong>Type:</strong> ${projectTypeName}</p>
          <p><strong>Timeline Preference:</strong> ${data.timeline || 'Not specified'}</p>
          <p><strong>Budget Range:</strong> ${data.budget || 'Not specified'}</p>
          <p><strong>Features Selected:</strong></p>
          <ul>
            ${data.features.length > 0 ? data.features.map((f) => `<li>${f}</li>`).join('') : '<li>None (default package)</li>'}
          </ul>
        </div>

        <p><a href="${env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/estimates/${estimateId}" style="display: inline-block; background: #c0ff6b; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          View Full Details →
        </a></p>

        <p style="color: #666; font-size: 14px; margin-top: 24px;">
          Follow up within 24 hours for best conversion rate.
        </p>
      </div>
    `,
  });
}

/**
 * Main estimate controller
 */
export async function estimateController(req: Request, res: Response) {
  const data = req.body as EstimateRequest;
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.get('user-agent') || null;
  const referrer = req.get('referer') || null;

  try {
    logger.info(
      {
        email: data.email,
        projectType: data.projectType,
        featureCount: data.features?.length || 0,
        clientIp,
      },
      'Estimate request received',
    );

    // Validate input
    if (!data.email || !data.projectType) {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'Email and project type are required',
      });
    }

    if (!['website', 'ai-automation', 'both'].includes(data.projectType)) {
      return res.status(400).json({
        error: 'INVALID_PROJECT_TYPE',
        message: 'Invalid project type',
      });
    }

    // Calculate estimate
    const estimate = calculateEstimate(data);

    // Generate AI recommendations (run in parallel with database save)
    const [aiContent] = await Promise.all([
      generateAIRecommendations(data),

      // Save to database
      db.estimateRequest.create({
        data: {
          email: data.email,
          projectType: data.projectType,
          timeline: data.timeline || null,
          features: data.features || [],
          budget: data.budget || null,
          estimatedMin: estimate.min,
          estimatedMax: estimate.max,
          estimatedWeeks: estimate.weeks,
          ipAddress: clientIp,
          userAgent,
          referrer,
        },
      }),
    ]);

    const savedEstimate = await db.estimateRequest.findFirst({
      where: { email: data.email },
      orderBy: { createdAt: 'desc' },
    });

    // Update with AI content
    if (savedEstimate) {
      await db.estimateRequest.update({
        where: { id: savedEstimate.id },
        data: {
          aiRecommendations: aiContent.recommendations,
          aiAnalysis: aiContent.analysis,
        },
      });
    }

    // Send emails (don't wait for completion)
    void Promise.all([
      sendEstimateEmail(data.email, estimate, aiContent, data),
      sendAdminNotification(estimate, data, savedEstimate?.id || ''),
    ]).catch((error) => {
      logger.error({ error }, 'Failed to send estimate emails');
    });

    logger.info(
      {
        email: data.email,
        estimateId: savedEstimate?.id,
        estimatedMin: estimate.min,
        estimatedMax: estimate.max,
      },
      'Estimate request processed successfully',
    );

    // Return response
    return res.status(200).json({
      success: true,
      estimate: {
        min: estimate.min,
        max: estimate.max,
        weeks: estimate.weeks,
        recommendations: aiContent.recommendations,
        analysis: aiContent.analysis,
      },
    });
  } catch (error) {
    logger.error({ error, clientIp }, 'Estimate controller failed');

    return res.status(500).json({
      error: 'ESTIMATE_FAILED',
      message: 'Failed to process your estimate request. Please try again.',
    });
  }
}
