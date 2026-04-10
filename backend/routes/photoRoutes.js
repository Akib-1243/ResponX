import express from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import { getAllPhotos, createPhoto } from '../controllers/photoController.js';

const photoRouter = express.Router();

photoRouter.get('/', getAllPhotos);
photoRouter.post('/', protect, restrictTo('admin'), createPhoto);

export default photoRouter;
