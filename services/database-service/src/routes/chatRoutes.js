// src/routes/chatRoutes.js
import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { createChat, getChat } from '../controllers/chatController.js';

const router = Router();

router.post('/', authMiddleware, createChat);
router.get('/:chatId', authMiddleware, getChat);

export default router;
