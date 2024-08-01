// src/routes/authRoutes.ts
import { Router } from 'express';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import { createToken, revokeToken, validateToken } from '../services/tokenService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.post('/login', async (req, res, next) => {
  passport.authenticate('local', async (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const accessToken = await createToken(user.id, 'access');
    const refreshToken = await createToken(user.id, 'refresh');

    res.json({ accessToken, refreshToken });
  })(req, res, next);
});

router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      provider: 'local',
      providerId: null,
    },
  });

  const accessToken = await createToken(user.id, 'access');
  const refreshToken = await createToken(user.id, 'refresh');

  res.status(201).json({ accessToken, refreshToken });
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const decoded = await validateToken(refreshToken, 'refresh');
    const accessToken = await createToken(decoded.userId, 'access');

    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;

  try {
    await revokeToken(refreshToken);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
});

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/login'
}), async (req, res) => {
  const user = req.user as any;
  const accessToken = await createToken(user.id, 'access');
  const refreshToken = await createToken(user.id, 'refresh');

  res.redirect(`/?accessToken=${accessToken}&refreshToken=${refreshToken}`);
});

router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/auth/facebook/callback', passport.authenticate('facebook', {
  failureRedirect: '/login'
}), async (req, res) => {
  const user = req.user as any;
  const accessToken = await createToken(user.id, 'access');
  const refreshToken = await createToken(user.id, 'refresh');

  res.redirect(`/?accessToken=${accessToken}&refreshToken=${refreshToken}`);
});

export default router;
