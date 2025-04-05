const jwt = require('jsonwebtoken');
const User = require('../../models/user.model');

/**
 * Middleware to authenticate user token
 */
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists
    const user = await User.findById(decoded.user.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Add user info to request
    req.user = decoded.user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

/**
 * Middleware to check user role/type
 * @param {Array} roles - Array of allowed user types
 */
exports.authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({ 
        message: 'Access denied. You do not have the required permissions.' 
      });
    }
    next();
  };
};
