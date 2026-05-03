// Simple API key authentication middleware for admin routes
// In production, replace with JWT + bcrypt auth system

const jwt = require('jsonwebtoken');

function adminAuth(req, res, next) {
  // Allow bypassing auth in dev if no password is set (convenience)
  if (process.env.NODE_ENV !== 'production' && !process.env.ADMIN_PASSWORD) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev_only');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden. Admin role required.' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Invalid or expired token.' });
  }
}

module.exports = adminAuth;
