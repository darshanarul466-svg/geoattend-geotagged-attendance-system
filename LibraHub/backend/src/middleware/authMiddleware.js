const { verifyAuthToken } = require('../utils/authUtils');

/**
 * Middleware: Verify Bearer authentication token
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7).trim() 
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in to access this feature.'
    });
  }

  const payload = verifyAuthToken(token);
  if (!payload) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token. Please sign in again.'
    });
  }

  req.user = payload;
  next();
}

/**
 * Middleware: Enforce Admin privileges
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access Denied: Chief Librarian (Admin) privileges required for this action.'
    });
  }

  next();
}

/**
 * Optional Authentication: Attaches req.user if valid token present, does not block if missing
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7).trim() 
    : null;

  if (token) {
    const payload = verifyAuthToken(token);
    if (payload) {
      req.user = payload;
    }
  }
  next();
}

module.exports = {
  authenticateToken,
  requireAdmin,
  optionalAuth
};
