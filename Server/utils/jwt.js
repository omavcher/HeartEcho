const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-referral-secret-key';
const JWT_EXPIRES_IN = '30d';

// Generate token for referral creator
exports.generateCreatorToken = (creator) => {
  return jwt.sign(
    { 
      id: creator._id, 
      referralId: creator.referralId,
      type: 'referral_creator'
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Verify token
exports.verifyCreatorToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Middleware to verify referral creator
exports.verifyReferralCreator = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.type !== 'referral_creator') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    const Creator = require('../models/ReferralCreator');
    const creator = await Creator.findById(decoded.id);
    
    if (!creator) {
      return res.status(401).json({
        success: false,
        message: 'Creator not found'
      });
    }

    req.creator = creator;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};