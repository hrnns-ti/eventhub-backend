import express from 'express';
import { checkoutTicket, confirmPayment, cancelTransaction, refundTransaction } from '../controllers/transaction.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/checkout', verifyToken, checkoutTicket);
router.post('/payment-callback', confirmPayment);
router.post('/cancel', verifyToken, cancelTransaction);
router.post('/refund', verifyToken, refundTransaction);

export default router;