// src/controllers/folderController.js
import Chat from '../models/Chat.js';
import Folder from '../models/Folder.js';

export const createFolder = async (req, res) => {
  try {
    const { folderId, folderName, username } = req.body;
    const folder = new Folder({ folderId, folderName, username });
    await folder.save();
    res.status(201).json(folder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
    if (!folderId) {
      return res.status(400).json({ error: "Folder ID query parameter required" });
    }
    const folders = await Folder.findOne({ folderId });
    return res.status(200).json(folders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFolders = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ error: "Username query parameter required" });
    }
    const folders = await Folder.find({ username });
    return res.status(200).json(folders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
    const { folderName } = req.body;

    const updatedFolder = await Folder.findOneAndUpdate(
      { folderId },
      { folderName },
      { new: true }
    );
    if (!updatedFolder) {
      return res.status(404).json({ error: "Folder not found" });
    }
    return res.status(200).json(updatedFolder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
    const deletedFolder = await Folder.findOneAndDelete({ folderId });
    if (!deletedFolder) {
      return res.status(404).json({ error: "Folder not found" });
    }
    await Chat.deleteMany({ folderId });
    return res.status(200).json({ message: "Folder and associated chats deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};