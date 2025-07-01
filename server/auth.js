const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res
        .status(401)
        .json({ error: "No token provided", clearAuth: true });
    }

    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return res
        .status(401)
        .json({ error: "Malformed token", clearAuth: true });
    }

    const decoded = jwt.verify(token, "your-secret-key");
    req.user = { _id: decoded._id }; // Attach user data to request
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token", clearAuth: true });
  }
};
