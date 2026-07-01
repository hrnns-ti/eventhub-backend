import express from 'express';
import { registerUser, loginUser, updateProfile, getMyProfile, getUserProfileById } from '../controllers/user.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser)

router.put('/profile', verifyToken, updateProfile);
router.get('/me', verifyToken, getMyProfile);
router.get('/:id', verifyToken, getUserProfileById);

export default router;