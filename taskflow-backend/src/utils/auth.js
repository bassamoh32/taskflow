import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * Hash password with bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare plain password with hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>}
 */
export const comparePasswords = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Generate JWT token
 * @param {string} userId - User ID
 * @returns {string} - JWT token
 */
export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {object} - Decoded token
 */
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
