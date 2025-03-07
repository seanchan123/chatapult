// src/controllers/chatController.js
import Chat from '../models/Chat.js';

export const createChat = async (req, res) => {
  try {
    const { userId, folderId, chatId, messages } = req.body;
    const chat = new Chat({ userId, folderId, chatId, messages });
    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findOne({ chatId });
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
