// src/app/chats/page.tsx
"use client";

import Link from "next/link";
import React, { useState } from "react";

const ChatsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [folders, setFolders] = useState<Folder[]>([
    { id: "1", name: "Folder 1", files: [] },
    { id: "2", name: "Folder 2", files: [] },
  ]);
  // Handle adding new folder
  const addNewFolder = () => {
    const newFolderId = (folders.length + 1).toString(); // Generate new ID
    const newFolderName = `Folder ${newFolderId}`; // Generate new folder name
    setFolders([
      ...folders,
      { id: newFolderId, name: newFolderName, files: [] },
    ]); // Add new folder to state
  };

  return (
    <div className="h-screen py-12 px-20">
      <div className="flex flex-col space-y-8 mt-28">
        {/* Actions Section */}
        <div>
          <div className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100">
            Search for your{" "}
            <span className="text-indigo-700 dark:text-indigo-500">chats</span>.
          </div>
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, tags, etc."
              required
              className="w-4/6 py-2 px-4 border rounded-md shadow-md focus:outline-none focus:ring focus:border-indigo-500 dark:bg-gray-200"
            />
            <button
              onClick={addNewFolder}
              className="w-1/6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-md  focus:outline-none"
            >
              New Folder
            </button>
            <Link
              href="/chats/new"
              className="w-1/6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-md text-center focus:outline-none"
            >
              New Chat
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChatsPage;
