import { Router } from 'express';
import { getDeliveries, updateDeliveryStatus } from '../controllers/deliveryController.ts';
import { authenticate, isAdmin } from '../middleware/auth.ts';

const router = Router();

router.get('/', authenticate, isAdmin, getDeliveries);
router.patch('/:id/status', authenticate, isAdmin, updateDeliveryStatus);

export default router;
