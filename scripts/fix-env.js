const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');
let content = fs.readFileSync(envPath, 'utf8');

// The JSON we want
const jsonVal = '{"Monday":[["09:00","17:00"]],"Tuesday":[["09:00","17:00"]],"Wednesday":[["09:00","17:00"]],"Thursday":[["09:00","17:00"]],"Friday":[["09:00","17:00"]]}';

// Use single quotes for the env var value to avoid escape hell
const newLine = `MIDWIFERY_HOURS_JSON='${jsonVal}'`;

// Remove existing lines starting with MIDWIFERY_HOURS_JSON
const lines = content.split('\n').filter(line => !line.startsWith('MIDWIFERY_HOURS_JSON'));
lines.push(newLine);

fs.writeFileSync(envPath, lines.join('\n'));
console.log('Fixed .env');
