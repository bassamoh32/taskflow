import { validationResult } from 'express-validator';
import { AppError } from '../utils/errorHandler.js';

/**
 * Validation middleware - Check for validation errors
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array()
      .map((err) => `${err.param}: ${err.msg}`)
      .join('; ');
    return next(new AppError(message, 400));
  }
  next();
};
