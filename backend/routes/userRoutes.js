import express from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import { getUserData, getAllUsers, updateUserStatus, createAdminUser, deleteUser } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get('/data', protect, getUserData);
userRouter.get('/all', protect, restrictTo('admin'), getAllUsers);
userRouter.put('/:id/status', protect, restrictTo('admin'), updateUserStatus);
userRouter.post('/create-admin', protect, restrictTo('admin'), createAdminUser);
userRouter.delete('/:id', protect, restrictTo('admin'), deleteUser);

export default userRouter;