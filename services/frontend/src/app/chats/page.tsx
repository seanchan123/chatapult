// src/app/chats/page.tsx
"use client";

import Link from "next/link";
import React, { useState } from "react";

interface Folder {
  id: string;
  name: string;
  files: string[];
}

const ChatsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [folders, setFolders] = useState<Folder[]>([
    { id: "1", name: "Machine Learning", files: [] },
    { id: "2", name: "Data Analytics", files: [] },
  ]);

  // Prevent default behavior for drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Handle adding new folder
  const addNewFolder = () => {
    const newFolderId = (folders.length + 1).toString();
    const newFolderName = `Folder ${newFolderId}`;
    setFolders([
      ...folders,
      { id: newFolderId, name: newFolderName, files: [] },
    ]);
  };

  return (
    <div className="h-screen py-12 px-20">
      <div className="flex flex-col space-y-8 mt-28">
        {/* Actions Section */}
        <div>
          <div className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
            Search for your{" "}
            <span className="text-indigo-700 dark:text-indigo-500">
              item(s)
            </span>
            .
          </div>
          <div className="flex space-x-6 mb-4">
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

        {/* Folders Section */}
        <div>
          <div className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
            All your{" "}
            <span className="text-indigo-700 dark:text-indigo-500">
              folders
            </span>
            .
          </div>
          <div className="flex space-x-8">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="p-4 w-60 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100 rounded-md shadow-lg flex flex-col justify-between"
                onDragOver={handleDragOver}
              >
                {/* Icon and Folder Name in Same Line */}
                <div className="flex items-center space-x-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6 text-gray-700 dark:text-gray-100"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                    />
                  </svg>
                  <h2 className="text-lg font-semibold truncate w-40">
                    {folder.name}
                  </h2>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatsPage;
