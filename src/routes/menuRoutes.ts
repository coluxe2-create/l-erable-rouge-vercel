import { Router } from 'express';
import { 
  getMenuItems, 
  createMenuItem, 
  updateMenuItem, 
  deleteMenuItem,
  getCategories,
  createCategory
} from '../controllers/menuController.ts';
import { authenticate, isAdmin } from '../middleware/auth.ts';
import { upload } from '../middleware/upload.ts';

const router = Router();

// Categories
router.get('/categories', getCategories);
router.post('/categories', authenticate, isAdmin, createCategory);

// Menu Items
router.get('/', getMenuItems);
router.post('/', authenticate, isAdmin, upload.single('photo'), createMenuItem);
router.put('/:id', authenticate, isAdmin, upload.single('photo'), updateMenuItem);
router.delete('/:id', authenticate, isAdmin, deleteMenuItem);

export default router;
