import express from 'express';
import {
  getAllRequests,
  getRequest,
  createRequest,
  updateRequest,
  deleteRequest,
} from '../controllers/aidRequestController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.get('/',     protect, getAllRequests);
router.get('/:id',  protect, getRequest);
router.post('/',    protect, createRequest);
router.put('/:id',  protect, updateRequest);
router.delete('/:id', protect, restrictTo('admin'), deleteRequest);

export default router;
