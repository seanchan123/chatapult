// src/models/Chat.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'system'], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
  username: { type: String, required: true },
  folderId: { type: String, required: false },
  chatId: { type: String, required: true },
  chatName: { type: String, required: true },
  tags: { type: [String], default: [] },
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now }
});

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
