import express from 'express';
import {
  getAllShelters,
  getShelter,
  createShelter,
  updateShelter,
  deleteShelter,
} from '../controllers/shelterController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.get('/',     getAllShelters);           // public
router.get('/:id',  getShelter);               // public

router.post('/',         protect, restrictTo('admin', 'volunteer'), createShelter);
router.put('/:id',       protect, restrictTo('admin'), updateShelter);
router.delete('/:id',    protect, restrictTo('admin'), deleteShelter);

export default router;
