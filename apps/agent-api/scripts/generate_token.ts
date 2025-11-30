import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const secret = process.env.JWT_SECRET || '';
if (!secret) {
  console.error('JWT_SECRET not set in env');
  process.exit(1);
}

const payload = {
  sub: 'demo-user',
  tenant: 'demo',
  role: 'admin',
};

const token = jwt.sign(payload as any, secret, {
  algorithm: (process.env.JWT_ALGORITHM || 'HS256') as any,
  expiresIn: '7d',
});
console.log('Generated token:');
console.log(token);
