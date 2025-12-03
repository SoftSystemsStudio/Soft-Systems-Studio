import jwt, { type Algorithm, type JwtPayload } from 'jsonwebtoken';
import * as dotenv from 'dotenv';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
dotenv.config();

const secret = process.env.JWT_SECRET || '';
if (!secret) {
  console.error('JWT_SECRET not set in env');
  process.exit(1);
}

interface TokenPayload extends JwtPayload {
  sub: string;
  tenant: string;
  role: string;
}

const payload: TokenPayload = {
  sub: 'demo-user',
  tenant: 'demo',
  role: 'admin',
};

const algorithm = (process.env.JWT_ALGORITHM || 'HS256') as Algorithm;

const token = jwt.sign(payload, secret, {
  algorithm,
  expiresIn: '7d',
});
console.log('Generated token:');
console.log(token);
