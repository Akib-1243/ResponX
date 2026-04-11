import express from 'express';
import {
  getAllMissingPersons,
  getMissingPerson,
  createMissingPerson,
  markAsFound,
  deleteMissingPerson,
} from '../controllers/missingPersonController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.get('/',                 getAllMissingPersons);
router.get('/:id',              protect, getMissingPerson);
router.post('/',                protect, createMissingPerson);
router.patch('/:id/found',      protect, restrictTo('volunteer', 'admin'), markAsFound);
router.delete('/:id',           protect, restrictTo('admin'), deleteMissingPerson);

export default router;
