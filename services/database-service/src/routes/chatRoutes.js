// src/routes/chatRoutes.js
import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { createChat, getChat, getChats, updateChatMessages, deleteChat } from '../controllers/chatController.js';

const router = Router();

router.get('/', authMiddleware, getChats)
router.get('/:chatId', authMiddleware, getChat);
router.post('/', authMiddleware, createChat);
router.put('/:chatId/messages', authMiddleware, updateChatMessages);
router.delete('/:chatId', authMiddleware, deleteChat);

export default router;
