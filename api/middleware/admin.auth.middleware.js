import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_ADMIN_SECRET_KEY;


// Middleware to authenticate token
export const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
  
    if (!token) return res.status(401).json({ message: 'No token provided' });
  
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: 'Invalid token' });
  
      req.user = user; // Attach user information to the request
      next();
    });
  };