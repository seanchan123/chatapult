// src/routes/chatRoutes.js
import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { createFolder, getFolder, getFolders, updateFolder, deleteFolder } from '../controllers/folderController.js';

const router = Router();

router.post('/', authMiddleware, createFolder);
router.get('/', authMiddleware, getFolders);
router.get('/:folderId', authMiddleware, getFolder);
router.put('/:folderId', authMiddleware, updateFolder);
router.delete('/:folderId', authMiddleware, deleteFolder);

export default router;
