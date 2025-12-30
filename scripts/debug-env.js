const dotenv = require('./apps/voice-receptionist/node_modules/dotenv');
const path = require('path');

const p = path.resolve(__dirname, '..', '.env');
console.log('Loading env from:', p);

const result = dotenv.config({ path: p });

if (result.error) {
    console.error('Error loading env:', result.error);
}

const val = process.env.MIDWIFERY_HOURS_JSON;
console.log('Raw Value:', val);
console.log('Type:', typeof val);

try {
    const parsed = JSON.parse(val);
    console.log('Parsed successfully:', parsed);
} catch (e) {
    console.error('Parse Error:', e.message);
}
