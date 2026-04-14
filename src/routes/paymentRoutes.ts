import { Router } from 'express';
import { initiateCmiPayment, handleCmiCallback, handleCmiSuccess, handleCmiFailure, recordPayment } from '../controllers/paymentController.ts';

const router = Router();

router.post('/cmi/initiate', initiateCmiPayment);
router.post('/cmi/callback', handleCmiCallback); // Public callback for CMI
router.post('/cmi/success', handleCmiSuccess);
router.post('/cmi/failure', handleCmiFailure);
router.post('/record', recordPayment);

export default router;
