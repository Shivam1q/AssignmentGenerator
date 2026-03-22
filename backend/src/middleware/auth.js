const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.vedaai_token) {
    token = req.cookies.vedaai_token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_vedaai_2026');
      
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found.' });
      }
      
      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed.' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided.' });
  }
};

module.exports = { protect };
