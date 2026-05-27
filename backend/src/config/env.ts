import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env = {
  MONGODB_URI: required('MONGODB_URI'),
  REDIS_URL: required('REDIS_URL'),
  JWT_SECRET: required('JWT_SECRET'),
  AWS_ACCESS_KEY_ID: required('AWS_ACCESS_KEY_ID'),
  AWS_SECRET_ACCESS_KEY: required('AWS_SECRET_ACCESS_KEY'),
  AWS_DEFAULT_REGION: process.env.AWS_DEFAULT_REGION || 'us-east-1',
  PORT: parseInt(process.env.PORT || '4000', 10),
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
};
