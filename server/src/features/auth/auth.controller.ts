import { NextFunction, Request, Response } from 'express';
import { logger } from '../../utils/logger';
import { handleClerkService } from './auth.service';

export const handleClerkWebHook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.info('Received Clerk Webhook', { type: req.body?.type });

  try {
    const result = await handleClerkService(req.body);
    res.status(200).json({ success: true, result });
  } catch (error) {
    logger.error('Error processing clerk webhook ', {
      error: error instanceof Error ? error.message : String(error),
    });
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  res.json({
    user: {
      id: req.user.id,
      clerkId: req.user.clerkId,
      email: req.user.email,
    },
  });
};
