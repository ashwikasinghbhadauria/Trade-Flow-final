/**
 * auth.js — Authentication Routes
 */

import express from 'express';
import { signup, signin, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/login', signin); // alias
router.get('/me', authenticate, getMe);

export default router;
