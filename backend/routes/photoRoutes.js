import express from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import { getAllPhotos, createPhoto, deletePhoto } from '../controllers/photoController.js';

const photoRouter = express.Router();

photoRouter.get('/', getAllPhotos);
photoRouter.post('/', protect, restrictTo('admin'), createPhoto);
photoRouter.delete('/:id', protect, restrictTo('admin'), deletePhoto);

export default photoRouter;
