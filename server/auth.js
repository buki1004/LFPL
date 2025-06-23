const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    console.log('Received headers:', req.headers);
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      console.log('No authorization header found');
      return res.status(401).json({ error: 'No token provided'});
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      console.log('Empty token');
      return res.status(401).json({ error: 'Malformed token'});
    }

    console.log('Veryfing token: ', token);
    const decoded = jwt.verify(token, 'your-secret-key'); // Same key used in login
    req.user = decoded; // Attach user data to request
    next();
  } catch (error) {
    /*console.error('Auth error:', error.message);*/
    res.status(401).json({ error: 'Invalid token' });
  }
};