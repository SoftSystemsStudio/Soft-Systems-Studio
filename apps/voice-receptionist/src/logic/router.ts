import { toZonedTime, format } from 'date-fns-tz';
import { config, getBusinessHours } from '../config';

export type UrgencyLevel = 'normal' | 'priority_callback' | 'on_call' | 'emergency_redirect';

export interface RoutingContext {
  isBusinessHours: boolean;
  urgency: UrgencyLevel;
}

const URGENCY_KEYWORDS = [
  'severe pain',
  'heavy bleeding',
  'fainting',
  'newborn breathing',
  'water broke',
  'decreased fetal movement',
  'dolor severo',
  'sangrado abundante',
  'desmayo',
  'respiración del recién nacido',
  'rompió fuente',
  'disminución movimiento fetal',
];

export function detectUrgency(text: string): UrgencyLevel {
  const lowerText = text.toLowerCase();
  for (const keyword of URGENCY_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      return 'on_call';
    }
  }
  return 'normal';
}

export function isBusinessHours(date: Date = new Date()): boolean {
  const timeZone = config.MIDWIFERY_TIMEZONE;
  const zonedDate = toZonedTime(date, timeZone);
  const day = format(zonedDate, 'EEE', { timeZone }).toLowerCase(); // mon, tue, wed...
  const time = format(zonedDate, 'HH:mm', { timeZone });

  const hours = getBusinessHours();
  const allowedDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  if (!allowedDays.includes(day)) {
    return false;
  }
  // `day` is validated against `allowedDays` above, so dynamic access is safe.
  // eslint-disable-next-line security/detect-object-injection
  const todayHours = hours[day];

  if (!todayHours) {
    return false;
  }

  for (const [start, end] of todayHours) {
    if (time >= start && time <= end) {
      return true;
    }
  }

  return false;
}
