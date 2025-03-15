// src/routes/chatRoutes.js
import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { createChat, getChat, updateChat, deleteChat } from '../controllers/chatController.js';

const router = Router();

router.post('/', authMiddleware, createChat);
router.get('/:chatId', authMiddleware, getChat);
router.put('/:chatId', authMiddleware, updateChat);
router.delete('/:chatId', authMiddleware, deleteChat);

export default router;
