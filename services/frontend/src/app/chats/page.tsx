// src/app/chats/page.tsx
"use client";

import Link from "next/link";
import React, { useState } from "react";

interface Chat {
  id: string;
  name: string;
  date: string;
  tags: string[];
}

interface Folder {
  id: string;
  name: string;
  chats: string[];
}

const ChatsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [folders, setFolders] = useState<Folder[]>([
    { id: "1", name: "Machine Learning", chats: [] },
    { id: "2", name: "Data Analytics", chats: [] },
  ]);
  const [chats, setChats] = useState<Chat[]>([
    {
      id: "1",
      name: "Jon Jones",
      date: "19/07/1987",
      tags: ["Bones", "Drugs", "GOAT"],
    },
    {
      id: "2",
      name: "Alex Pereira",
      date: "07/07/1987",
      tags: ["Poatan", "Left-hook", "Beer"],
    },
    {
      id: "3",
      name: "Charles Oliveira",
      date: "17/10/1989",
      tags: ["Cowboy", "Skull", "BJJ"],
    },
    {
      id: "4",
      name: "Kamaru Usman",
      date: "11/05/1987",
      tags: ["Nigerian Nightmare", "Wrestling", "Champ"],
    },
    {
      id: "5",
      name: "Israel Adesanya",
      date: "22/07/1989",
      tags: ["Stylebender", "Kickboxing", "UFC"],
    },
    {
      id: "6",
      name: "Conor McGregor",
      date: "14/07/1988",
      tags: ["Notorious", "Striking", "Whiskey"],
    },
    {
      id: "7",
      name: "Anderson Silva",
      date: "14/04/1975",
      tags: ["Spider", "Muay Thai", "Legend"],
    },
    {
      id: "8",
      name: "Georges St-Pierre",
      date: "19/05/1981",
      tags: ["GSP", "Wrestling", "GOAT"],
    },
    {
      id: "9",
      name: "Daniel Cormier",
      date: "20/03/1979",
      tags: ["DC", "Wrestling", "Analyst"],
    },
    {
      id: "10",
      name: "Khabib Nurmagomedov",
      date: "20/09/1988",
      tags: ["Eagle", "Sambo", "GOAT"],
    },
  ]);

  const [draggingChat, setDraggingChat] = useState<string | null>(null);

  const handleDragStart = (chatId: string) => {
    setDraggingChat(chatId);
  };

  const handleDrop = (folderId: string) => {
    if (draggingChat) {
      setFolders((prevFolders) =>
        prevFolders.map((folder) =>
          folder.id === folderId
            ? { ...folder, chats: [...folder.chats, draggingChat] }
            : folder
        )
      );
      setChats((prevChats) =>
        prevChats.filter((chat) => chat.id !== draggingChat)
      );
      setDraggingChat(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const addNewFolder = () => {
    const newFolderId = (folders.length + 1).toString();
    const newFolderName = `Folder ${newFolderId}`;
    setFolders([
      ...folders,
      { id: newFolderId, name: newFolderName, chats: [] },
    ]);
  };

  return (
    <div className="min-h-screen py-8 px-4 md:px-20">
      <div className="flex flex-col space-y-8 mt-10 md:mt-28">
        {/* Actions Section */}
        <div>
          <div className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
            Search for your{" "}
            <span className="text-indigo-700 dark:text-indigo-500">
              item(s)
            </span>
            .
          </div>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, tags, etc."
              required
              className="w-full md:w-4/6 py-2 px-4 border rounded-md shadow-md focus:outline-none focus:ring focus:border-indigo-500 dark:bg-gray-200"
            />
            <button
              onClick={addNewFolder}
              className="w-full md:w-1/6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-md focus:outline-none"
            >
              New Folder
            </button>
            <Link
              href="/chats/new"
              className="w-full md:w-1/6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-md text-center focus:outline-none"
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
          <div className="flex flex-wrap gap-4">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="p-4 w-full md:w-60 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 rounded-md shadow-lg flex flex-col cursor-pointer justify-between"
                onDrop={() => handleDrop(folder.id)}
                onDragOver={handleDragOver}
              >
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
                  <h2 className="text-lg font-medium truncate w-40">
                    {folder.name}
                  </h2>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chats Section */}
        <div>
          <div className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
            All your{" "}
            <span className="text-indigo-700 dark:text-indigo-500">chats</span>.
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className="p-4 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 font-medium rounded-md shadow-md cursor-pointer"
                draggable
                onDragStart={() => handleDragStart(chat.id)}
              >
                <div className="truncate w-full text-lg font-bold">
                  {chat.name}
                </div>
                <div className="font-light text-sm">Last used: {chat.date}</div>
                <div className="overflow-hidden">
                  <span className="text-sm font-medium text-gray-400">
                    Tags:{" "}
                  </span>
                  <div className="flex space-x-1 h-8 whitespace-nowrap no-scrollbar overflow-y-hidden">
                    {chat.tags.length > 0 ? (
                      chat.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-indigo-600 text-white text-xs px-3 py-2 rounded-md"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">-</span>
                    )}
                  </div>
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
