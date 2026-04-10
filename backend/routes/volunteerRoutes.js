import express from 'express';
import {
  getAllTasks,
  createTask,
  toggleAssign,
  deleteTask,
} from '../controllers/volunteerController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.get('/',              protect, getAllTasks);
router.post('/',             protect, restrictTo('admin'), createTask);
router.put('/:id/assign',    protect, toggleAssign);
router.delete('/:id',        protect, restrictTo('admin'), deleteTask);

export default router;
