import jwt from 'jsonwebtoken';

export function verifyToken(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided.' });
  }
  const token = header.slice(7);
  try {
    const secret = process.env.JWT_SECRET || 'transitops_jwt_secret_key';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}
