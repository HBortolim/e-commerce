// src/controllers/authController.ts
import { Request, Response } from 'express';
import { Router } from 'express';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import { createToken, revokeToken, validateToken } from '../services/tokenService';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const user = await createUser(req.body);
    const accessToken = await generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);
    res.status(201).json({ accessToken, refreshToken });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const loginUser = async (req: Request, res: Response, next: any) => {
  passport.authenticate('local', async (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const accessToken = await generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);
    res.json({ accessToken, refreshToken });
  })(req, res, next);
};

export const googleCallback = async (req: Request, res: Response) => {
  try {
    const user = await handleGoogleCallback(req, res);
    const accessToken = await generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);
    res.redirect(`/?accessToken=${accessToken}&refreshToken=${refreshToken}`);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const facebookCallback = async (req: Request, res: Response) => {
  try {
    const user = await handleFacebookCallback(req, res);
    const accessToken = await generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);
    res.redirect(`/?accessToken=${accessToken}&refreshToken=${refreshToken}`);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const accessToken = await refreshAccessToken(refreshToken);
    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    await revokeToken(refreshToken);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};
