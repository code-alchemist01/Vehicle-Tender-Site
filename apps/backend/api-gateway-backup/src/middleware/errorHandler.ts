import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import config from '../config';

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { statusCode = 500, message } = error;

  // Log the error
  logger.error('API Gateway Error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
  }

  if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized access';
  }

  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid data format';
  }

  // Don't expose internal errors in production
  if (config.env === 'production' && statusCode === 500) {
    message = 'Internal server error';
  }

  const errorResponse = {
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method,
    },
    ...(config.env !== 'production' && { stack: error.stack }),
  };

  res.status(statusCode).json(errorResponse);
};

export const notFoundHandler = (req: Request, res: Response) => {
  // Skip 404 handler for WebSocket endpoints - they are handled by WebSocket server
  if (req.path.startsWith('/ws/')) {
    return; // Let WebSocket handle its own routes
  }
  
  const message = `Route ${req.method} ${req.url} not found`;
  
  logger.warn('Route not found:', {
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  res.status(404).json({
    error: {
      message,
      statusCode: 404,
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method,
    },
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};