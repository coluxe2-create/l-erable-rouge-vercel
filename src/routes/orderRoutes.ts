import { Router } from 'express';
import { createOrder, getOrders, updateOrderStatus } from '../controllers/orderController.ts';
import { authenticate, isAdmin } from '../middleware/auth.ts';

const router = Router();

router.post('/', createOrder);
router.get('/', authenticate, getOrders);
router.get('/my-orders', authenticate, getOrders);
router.patch('/:id/status', authenticate, isAdmin, updateOrderStatus);

export default router;
