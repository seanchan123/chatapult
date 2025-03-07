// src/models/Chat.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'system'], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  folderId: { type: String, required: true },
  chatId: { type: String, required: true },
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now }
});

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
