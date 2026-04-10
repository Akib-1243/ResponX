import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

export const protect = async (req, res, next) => {
  const { token } = req.cookies || {};
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Login required.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);

    if (!user) {
      // User was deleted from database
      res.clearCookie('token');
      return res.status(401).json({ success: false, message: 'Unauthorized. User not found.' });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    // Token is invalid
    res.clearCookie('token');
    return res.status(401).json({ success: false, message: 'Unauthorized. Invalid token.' });
  }
};

export const restrictTo = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Forbidden. Insufficient privileges.' });
  }
  next();
};
