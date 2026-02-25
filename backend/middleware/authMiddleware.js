const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isDBConnected } = require('../config/db');
const { findUserById } = require('../config/memStore');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (isDBConnected()) {
        // MongoDB path
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
          return res.status(401).json({ success: false, message: 'User not found' });
        }
      } else {
        // In-memory path — look up by UUID id
        const memUser = findUserById(decoded.id);
        if (!memUser) {
          return res.status(401).json({ success: false, message: 'User not found' });
        }
        // Expose a clean user object without the hashed password
        const { password: _pw, ...safeUser } = memUser;
        req.user = safeUser;
      }

      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
