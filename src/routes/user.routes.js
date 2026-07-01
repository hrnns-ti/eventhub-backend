import express from 'express';
import { registerUser, loginUser } from '../controllers/user.controller.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser)

router.put('/profile', verifyToken, updateProfile);
router.get('/me', verifyToken, getMyProfile);
router.get('/:id', verifyToken, getUserProfileById);

export default router;