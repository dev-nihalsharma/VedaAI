import bcrypt from 'bcryptjs';
import { connectMongo } from './db/mongo';
import { UserModel } from './models/User';

async function main() {
  await connectMongo();
  const email = 'johndoe@vedaai.test';
  const existing = await UserModel.findOne({ email });
  if (existing) {
    console.log(`[seed] user ${email} already exists, skipping`);
    process.exit(0);
  }
  const passwordHash = await bcrypt.hash('password123', 10);
  await UserModel.create({
    email,
    passwordHash,
    name: 'John Doe',
    school: 'Delhi Public School, Sector-4, Bokaro',
    role: 'teacher',
  });
  console.log(`[seed] created user ${email} (password: password123)`);
  process.exit(0);
}

main().catch((e) => {
  console.error('[seed] failed', e);
  process.exit(1);
});
