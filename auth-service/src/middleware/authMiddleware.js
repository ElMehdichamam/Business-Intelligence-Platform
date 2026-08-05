const { verifyToken } = require('../services/jwtService');

/**
 * Verifies the Bearer token on the Authorization header and attaches
 * the decoded payload to req.user. Rejects with 401 if missing/invalid.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Missing or malformed Authorization header',
      errors: null
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      errors: null
    });
  }
}

module.exports = authMiddleware;
