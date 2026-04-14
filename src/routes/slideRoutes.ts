import { Router } from 'express';
import { 
  getSlides, 
  createSlide, 
  updateSlide, 
  deleteSlide,
  reorderSlides
} from '../controllers/slideController.ts';
import { authenticate, isAdmin } from '../middleware/auth.ts';
import { upload } from '../middleware/upload.ts';

const router = Router();

// Public routes
router.get('/', getSlides);

// Admin routes
router.post('/', authenticate, isAdmin, upload.single('photo'), createSlide);
router.put('/:id', authenticate, isAdmin, upload.single('photo'), updateSlide);
router.delete('/:id', authenticate, isAdmin, deleteSlide);
router.post('/reorder', authenticate, isAdmin, reorderSlides);

export default router;
