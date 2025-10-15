import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import config from '../config';
import logger from '../utils/logger';

// General rate limiter
export const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    error: 'Too many requests',
    message: `Too many requests from this IP, please try again after ${config.rateLimit.windowMs / 1000} seconds.`,
    retryAfter: config.rateLimit.windowMs / 1000,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded:', {
      ip: req.ip,
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent'),
    });
    
    res.status(429).json({
      error: 'Too many requests',
      message: `Too many requests from this IP, please try again after ${config.rateLimit.windowMs / 1000} seconds.`,
      retryAfter: config.rateLimit.windowMs / 1000,
    });
  },
});

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts',
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req: Request, res: Response) => {
    logger.warn('Auth rate limit exceeded:', {
      ip: req.ip,
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent'),
    });
    
    res.status(429).json({
      error: 'Too many authentication attempts',
      message: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
      retryAfter: 15 * 60,
    });
  },
});

// Lenient rate limiter for public endpoints
export const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('Public rate limit exceeded:', {
      ip: req.ip,
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent'),
    });
    
    res.status(429).json({
      error: 'Too many requests',
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: 15 * 60,
    });
  },
});

// Strict rate limiter for payment endpoints
export const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 payment requests per minute
  message: {
    error: 'Too many payment requests',
    message: 'Too many payment requests from this IP, please try again after 1 minute.',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('Payment rate limit exceeded:', {
      ip: req.ip,
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent'),
    });
    
    res.status(429).json({
      error: 'Too many payment requests',
      message: 'Too many payment requests from this IP, please try again after 1 minute.',
      retryAfter: 60,
    });
  },
});