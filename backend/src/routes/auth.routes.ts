import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { UserModel } from '../models/User';
import { signToken, requireAuth, AuthedRequest } from '../middleware/auth';

const router = Router();

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/login', async (req: Request, res: Response) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    return;
  }
  const { email, password } = parsed.data;
  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  const token = signToken(String(user._id));
  res.json({
    token,
    user: {
      _id: String(user._id),
      email: user.email,
      name: user.name,
      school: user.school,
      role: user.role,
    },
  });
});

router.get('/me', requireAuth, async (req: AuthedRequest, res: Response) => {
  const user = await UserModel.findById(req.userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({
    _id: String(user._id),
    email: user.email,
    name: user.name,
    school: user.school,
    role: user.role,
  });
});

export default router;
