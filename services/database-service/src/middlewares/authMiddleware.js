// src/middlewares/authMiddleware.js

export const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    // NOTE: To be added when the auth service is implemented
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};
