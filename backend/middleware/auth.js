const jwt = require('jsonwebtoken');

function getTokenFromHeader(req) {
  const h = req.headers['authorization'] || req.headers['Authorization'];
  if (!h) return null;
  const parts = h.trim().split(/\s+/);
  if (parts.length === 2 && /^Bearer$/i.test(parts[0])) return parts[1];
  if (parts.length === 1 && parts[0].split('.').length === 3) return parts[0];
  return null;
}

module.exports = (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
