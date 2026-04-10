import express from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import { getUserData, getAllUsers, createAdminUser } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get('/data', protect, getUserData);
userRouter.get('/all', protect, restrictTo('admin'), getAllUsers);
userRouter.post('/create-admin', protect, restrictTo('admin'), createAdminUser);

export default userRouter;