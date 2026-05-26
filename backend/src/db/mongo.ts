import mongoose from 'mongoose';
import { env } from '../config/env';

let connected = false;

export async function connectMongo(): Promise<void> {
  if (connected) return;
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10_000,
  });
  connected = true;
  console.log('[mongo] connected');
}
