import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// Enum values for validation
const FUEL_TYPES = ['BENZIN', 'DIZEL', 'HIBRIT', 'ELEKTRIK', 'LPG', 'CNG'];
const TRANSMISSIONS = ['MANUEL', 'OTOMATIK', 'YARIMOTOMATIK', 'CVT'];
const CONDITIONS = ['EXCELLENT', 'VERY_GOOD', 'GOOD', 'FAIR', 'POOR'];
const STATUSES = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'ACTIVE', 'SOLD', 'ARCHIVED'];

// Create vehicle validation schema
export const createVehicleSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title cannot exceed 200 characters',
      'any.required': 'Title is required'
    }),

  description: Joi.string()
    .max(2000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 2000 characters'
    }),

  brand: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Brand must be at least 2 characters long',
      'string.max': 'Brand cannot exceed 50 characters',
      'any.required': 'Brand is required'
    }),

  model: Joi.string()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.min': 'Model must be at least 1 character long',
      'string.max': 'Model cannot exceed 50 characters',
      'any.required': 'Model is required'
    }),

  year: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear() + 1)
    .required()
    .messages({
      'number.min': 'Year must be 1900 or later',
      'number.max': `Year cannot be later than ${new Date().getFullYear() + 1}`,
      'any.required': 'Year is required'
    }),

  mileage: Joi.number()
    .integer()
    .min(0)
    .max(9999999)
    .optional()
    .messages({
      'number.min': 'Mileage cannot be negative',
      'number.max': 'Mileage cannot exceed 9,999,999'
    }),

  fuelType: Joi.string()
    .valid(...FUEL_TYPES)
    .required()
    .messages({
      'any.only': `Fuel type must be one of: ${FUEL_TYPES.join(', ')}`,
      'any.required': 'Fuel type is required'
    }),

  transmission: Joi.string()
    .valid(...TRANSMISSIONS)
    .required()
    .messages({
      'any.only': `Transmission must be one of: ${TRANSMISSIONS.join(', ')}`,
      'any.required': 'Transmission is required'
    }),

  condition: Joi.string()
    .valid(...CONDITIONS)
    .required()
    .messages({
      'any.only': `Condition must be one of: ${CONDITIONS.join(', ')}`,
      'any.required': 'Condition is required'
    }),

  reservePrice: Joi.number()
    .positive()
    .max(99999999)
    .optional()
    .messages({
      'number.positive': 'Reserve price must be positive',
      'number.max': 'Reserve price cannot exceed 99,999,999'
    }),

  images: Joi.array()
    .items(Joi.string().uri())
    .max(10)
    .optional()
    .messages({
      'array.max': 'Maximum 10 images allowed',
      'string.uri': 'Each image must be a valid URL'
    })
});

// Update vehicle validation schema (all fields optional except those that shouldn't change)
export const updateVehicleSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200)
    .optional()
    .messages({
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title cannot exceed 200 characters'
    }),

  description: Joi.string()
    .max(2000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 2000 characters'
    }),

  brand: Joi.string()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Brand must be at least 2 characters long',
      'string.max': 'Brand cannot exceed 50 characters'
    }),

  model: Joi.string()
    .min(1)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Model must be at least 1 character long',
      'string.max': 'Model cannot exceed 50 characters'
    }),

  year: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear() + 1)
    .optional()
    .messages({
      'number.min': 'Year must be 1900 or later',
      'number.max': `Year cannot be later than ${new Date().getFullYear() + 1}`
    }),

  mileage: Joi.number()
    .integer()
    .min(0)
    .max(9999999)
    .optional()
    .messages({
      'number.min': 'Mileage cannot be negative',
      'number.max': 'Mileage cannot exceed 9,999,999'
    }),

  fuelType: Joi.string()
    .valid(...FUEL_TYPES)
    .optional()
    .messages({
      'any.only': `Fuel type must be one of: ${FUEL_TYPES.join(', ')}`
    }),

  transmission: Joi.string()
    .valid(...TRANSMISSIONS)
    .optional()
    .messages({
      'any.only': `Transmission must be one of: ${TRANSMISSIONS.join(', ')}`
    }),

  condition: Joi.string()
    .valid(...CONDITIONS)
    .optional()
    .messages({
      'any.only': `Condition must be one of: ${CONDITIONS.join(', ')}`
    }),

  status: Joi.string()
    .valid(...STATUSES)
    .optional()
    .messages({
      'any.only': `Status must be one of: ${STATUSES.join(', ')}`
    }),

  reservePrice: Joi.number()
    .positive()
    .max(99999999)
    .optional()
    .messages({
      'number.positive': 'Reserve price must be positive',
      'number.max': 'Reserve price cannot exceed 99,999,999'
    }),

  images: Joi.array()
    .items(Joi.string().uri())
    .max(10)
    .optional()
    .messages({
      'array.max': 'Maximum 10 images allowed',
      'string.uri': 'Each image must be a valid URL'
    })
});

// Query parameters validation schema
export const vehicleQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  brand: Joi.string().max(50).optional(),
  model: Joi.string().max(50).optional(),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).optional(),
  fuelType: Joi.string().valid(...FUEL_TYPES).optional(),
  transmission: Joi.string().valid(...TRANSMISSIONS).optional(),
  condition: Joi.string().valid(...CONDITIONS).optional(),
  status: Joi.string().valid(...STATUSES).optional(),
  minPrice: Joi.number().positive().optional(),
  maxPrice: Joi.number().positive().optional(),
  search: Joi.string().max(100).optional()
});

// Validation middleware function
export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors
        }
      });
      return;
    }
    
    next();
  };
};

// Query validation middleware
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.query, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      res.status(400).json({
        success: false,
        error: {
          message: 'Query validation failed',
          details: errors
        }
      });
      return;
    }
    
    next();
  };
};