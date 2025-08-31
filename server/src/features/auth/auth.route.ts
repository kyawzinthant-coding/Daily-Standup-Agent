import { Router } from 'express';
import { getProfile, handleClerkWebHook } from './auth.controller';
import { clerkAuthMiddleware } from '../../middleware/clerk-auth';

const authRoutes = Router();

authRoutes.post('/clerk/webhook', handleClerkWebHook);
authRoutes.get('/me', clerkAuthMiddleware, getProfile);

export default authRoutes;
