import { validateRequest } from 'twilio';
import { config } from '../config';

export function validateTwilioSignature(
  url: string,
  params: Record<string, unknown>,
  signature: string,
): boolean {
  const stringParams: Record<string, string> = {};
  const keyRegex = /^[a-zA-Z0-9_-]+$/;
  for (const [k, v] of Object.entries(params)) {
    if (!keyRegex.test(k)) continue;
    if (Array.isArray(v)) {
      // eslint-disable-next-line security/detect-object-injection
      stringParams[k] = v.map((x) => String(x)).join(',');
    } else {
      // eslint-disable-next-line security/detect-object-injection
      stringParams[k] = String(v ?? '');
    }
  }

  return validateRequest(config.TWILIO_AUTH_TOKEN, signature, url, stringParams);
}
