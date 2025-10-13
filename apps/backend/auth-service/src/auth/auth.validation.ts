import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { CustomError } from '../common/middleware/error.middleware';

export const validationRules = {
  register: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    
    body('password')
      .isLength({ min: 6, max: 128 })
      .withMessage('Password must be between 6 and 128 characters')
      .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one letter and one number'),
    
    body('firstName')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('First name is required and must be less than 50 characters')
      .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/)
      .withMessage('First name can only contain letters and spaces'),
    
    body('lastName')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Last name is required and must be less than 50 characters')
      .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/)
      .withMessage('Last name can only contain letters and spaces'),
    
    body('phone')
      .optional()
      .isMobilePhone('tr-TR')
      .withMessage('Please provide a valid Turkish phone number')
  ],

  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    
    body('newPassword')
      .isLength({ min: 6, max: 128 })
      .withMessage('New password must be between 6 and 128 characters')
      .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one letter and one number'),
    
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Password confirmation does not match new password');
        }
        return true;
      })
  ],

  updateProfile: [
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('First name must be less than 50 characters')
      .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/)
      .withMessage('First name can only contain letters and spaces'),
    
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Last name must be less than 50 characters')
      .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/)
      .withMessage('Last name can only contain letters and spaces'),
    
    body('phone')
      .optional()
      .isMobilePhone('tr-TR')
      .withMessage('Please provide a valid Turkish phone number'),
    
    body('bio')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Bio must be less than 500 characters'),
    
    body('location')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Location must be less than 100 characters')
  ],

  forgotPassword: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address')
  ],

  resetPassword: [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required'),
    
    body('password')
      .isLength({ min: 6, max: 128 })
      .withMessage('Password must be between 6 and 128 characters')
      .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one letter and one number'),
    
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match password');
        }
        return true;
      })
  ]
};

export const validateRequest = (validationType: keyof typeof validationRules) => {
  return [
    ...validationRules[validationType],
    (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);
      
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        throw new CustomError(`Validation failed: ${errorMessages.join(', ')}`, 400);
      }
      
      next();
    }
  ];
};

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: (error as any).param || (error as any).path,
      message: error.msg,
      value: (error as any).value
    }));
    
    res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: formattedErrors
      }
    });
    return;
  }
  
  next();
};