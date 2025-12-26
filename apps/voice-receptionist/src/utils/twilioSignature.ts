import { validateRequest } from 'twilio';
import { config } from '../config';

export function validateTwilioSignature(
  url: string,
  params: Record<string, any>,
  signature: string,
): boolean {
  return validateRequest(config.TWILIO_AUTH_TOKEN, signature, url, params);
}
