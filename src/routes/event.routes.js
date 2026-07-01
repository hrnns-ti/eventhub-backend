import express from 'express';
import { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent } from '../controllers/event.controller.js';
import { verifyToken, isOrganizer } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getAllEvents);
router.get('/:id', getEventById);

router.post('/', verifyToken, isOrganizer, createEvent);
router.put('/:id', verifyToken, isOrganizer, updateEvent);
router.delete('/:id', verifyToken, isOrganizer, deleteEvent);

export default router;