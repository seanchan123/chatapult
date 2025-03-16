// src/controllers/chatController.js
import Chat from '../models/Chat.js';

export const createChat = async (req, res) => {
  try {
    const { username, folderId, chatId, chatName, messages, tags } = req.body;
    const chat = new Chat({ username, folderId, chatId, chatName, messages, tags });
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

export const getChats = async (req, res) => {
  try {
    const { username, folderId } = req.query;
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    let query = { username };
    if (folderId) {
      if (folderId === 'none') {
        query.$or = [{ folderId: { $exists: false } }, { folderId: "" }];
      } else {
        query.folderId = folderId;
      }
    }
    const chats = await Chat.find(query);
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { chatName, folderId, tags } = req.body;
    
    const updates = {};
    if (chatName !== undefined) updates.chatName = chatName;
    if (folderId !== undefined) updates.folderId = folderId;
    if (tags !== undefined && Array.isArray(tags)) updates.tags = tags;

    const updatedChat = await Chat.findOneAndUpdate(
      { chatId },
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!updatedChat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    res.status(200).json(updatedChat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { messages } = req.body;

    const convertedMessages = messages.map((m) => ({
      ...m,
      timestamp: new Date(m.timestamp),
    }));

    const updatedChat = await Chat.findOneAndUpdate(
      { chatId },
      { messages: convertedMessages },
      { new: true, runValidators: true }
    );

    if (!updatedChat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.status(200).json(updatedChat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const deletedChat = await Chat.findOneAndDelete({ chatId });
    if (!deletedChat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};