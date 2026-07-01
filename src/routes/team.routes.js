import express from 'express';
import { createTeam, joinTeam } from '../controllers/team.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', verifyToken, createTeam);
router.post('/join', verifyToken, joinTeam);

export default router;