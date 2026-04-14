import { Router } from 'express';
import { createReservation, getReservations, updateReservationStatus } from '../controllers/reservationController.ts';
import { authenticate, isAdmin } from '../middleware/auth.ts';

const router = Router();

router.post('/', createReservation);
router.get('/', authenticate, getReservations);
router.get('/my-reservations', authenticate, getReservations);
router.patch('/:id/status', authenticate, isAdmin, updateReservationStatus);

export default router;
