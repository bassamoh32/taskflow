import { AppError } from '../utils/errorHandler.js';
import { verifyToken } from '../utils/auth.js';
import User from '../models/User.js';

/**
 * Authentication middleware - Verify JWT token and attach user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new AppError('No token provided. Please login.', 401));
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return next(new AppError('User not found or inactive.', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token has expired. Please login again.', 401));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please login again.', 401));
    }
    next(error);
  }
};

/**
 * Authorization middleware - Check user role
 * @param {...string} roles - Allowed roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `User role '${req.user.role}' is not authorized to access this route.`,
          403
        )
      );
    }
    next();
  };
};
