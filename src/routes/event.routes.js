import express from 'express';
import { createEvent, getAllEvents, getEventById } from '../controllers/event.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getAllEvents);
router.get('/:id', getEventById);

router.post('/', verifyToken, createEvent);

export default router;