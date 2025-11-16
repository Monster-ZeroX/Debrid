import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

/**
 * Authentication middleware
 * Validates AUTH_TOKEN if configured
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip auth if no token is configured
  if (!config.authToken) {
    return next();
  }

  // Check Authorization header
  const authHeader = req.headers.authorization;
  const tokenFromQuery = req.query.token as string;

  const providedToken = authHeader?.replace('Bearer ', '') || tokenFromQuery;

  if (providedToken !== config.authToken) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing authentication token',
    });
  }

  next();
}

/**
 * Error handling middleware
 */
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error('Error:', err);

  res.status(500).json({
    error: 'Internal Server Error',
    message: config.nodeEnv === 'development' ? err.message : 'An error occurred',
  });
}

/**
 * 404 handler
 */
export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
  });
}
