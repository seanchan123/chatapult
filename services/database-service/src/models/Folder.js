// src/models/Folder.js
import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema(
  {
    folderId: { type: String, required: true, unique: true },
    folderName: { type: String, required: true },
    username: { type: String, required: true },
  },
  { timestamps: true }
);

const Folder = mongoose.model("Folder", folderSchema);
export default Folder;
