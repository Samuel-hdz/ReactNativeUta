
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Get token from header - check both x-auth-token and Authorization header
  let token = req.header('x-auth-token');
  
  // Also check Authorization header (Bearer token)
  const authHeader = req.header('Authorization');
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
