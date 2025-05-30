// src/app/chats/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";

import { AuthContext } from "@/contexts/AuthContext";

interface Chat {
  chatId: string;
  chatName: string;
  createdAt: string;
  tags: string[];
}

interface Folder {
  folderId: string;
  folderName: string;
  username: string;
}

const ChatsPage: React.FC = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [folders, setFolders] = useState<Folder[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [draggingChat, setDraggingChat] = useState<string | null>(null);

  // State for folder modal
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      // Fetch folders for the logged-in user.
      const fetchFolders = async () => {
        try {
          const url = process.env.NEXT_PUBLIC_DATABASE_SERVICE_URL;
          if (!url) throw new Error("Database Service URL not defined in env");
          const response = await fetch(
            `${url}/api/folders?username=${user?.username}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user?.token}`,
              },
            }
          );
          if (response.ok) {
            const data: Folder[] = await response.json();
            setFolders(data);
          } else {
            console.error("Failed to fetch folders");
          }
        } catch (error) {
          console.error("Error fetching folders:", error);
        }
      };

      // Fetch chats from the database filtering by username.
      const fetchChats = async () => {
        try {
          const url = process.env.NEXT_PUBLIC_DATABASE_SERVICE_URL;
          if (!url) throw new Error("Database Service URL not defined in env");
          // Note: GET requests should not have a body. So we pass the username as a query param.
          const response = await fetch(
            `${url}/api/chats?username=${user?.username}&folderId=none`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user?.token}`,
              },
            }
          );
          if (response.ok) {
            const data: Chat[] = await response.json();
            setChats(data);
          } else {
            console.error("Failed to fetch chats");
          }
        } catch (error) {
          console.error("Error fetching chats:", error);
        }
      };

      fetchChats();
      fetchFolders();
    }
  }, [isAuthenticated, router, user?.username, user?.token]);
  
  if (!isAuthenticated) {
    return null;
  }

  // Filter chats and folders using the search term (case-insensitive)
  const lowerCaseSearch = search.trim().toLowerCase();
  const filteredChats = lowerCaseSearch
    ? chats.filter((chat) =>
        chat.chatName.toLowerCase().includes(lowerCaseSearch)
      )
    : chats;
  const filteredFolders = lowerCaseSearch
    ? folders.filter((folder) =>
        folder.folderName.toLowerCase().includes(lowerCaseSearch)
      )
    : folders;

  // Utility function to generate a GUID (for folderId)
  const generateGUID = (): string => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const handleDragStart = (chatId: string) => {
    setDraggingChat(chatId);
  };

  const handleDrop = async (folderId: string) => {
    if (draggingChat) {
      try {
        const url = process.env.NEXT_PUBLIC_DATABASE_SERVICE_URL;
        if (!url) throw new Error("Database Service URL not defined in env");
        
        // Call the API to update the chat's folderId.
        const response = await fetch(`${url}/api/chats/${draggingChat}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user?.token}`,
          },
          body: JSON.stringify({ folderId }),
        });
        
        if (!response.ok) {
          console.error("Failed to update chat folder");
        } else {
          console.log("Chat folder updated successfully");
          setChats((prevChats) => prevChats.filter((chat) => chat.chatId !== draggingChat));
        }
      } catch (error) {
        console.error("Error updating chat folder:", error);
      }
      setDraggingChat(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
  };
  
  // Create a new folder
  const createFolder = async () => {
    try {
      const url = process.env.NEXT_PUBLIC_DATABASE_SERVICE_URL;
      if (!url) throw new Error("Database Service URL not defined in env");
      const folderId = generateGUID();
      const folderData = {
        folderId,
        folderName: newFolderName,
        username: user?.username || "unknown",
      };
      const response = await fetch(`${url}/api/folders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token}`,
        },
        body: JSON.stringify(folderData),
      });
      if (!response.ok) {
        console.error("Failed to create folder");
      } else {
        console.log("Folder created successfully");
        // Update the folders state with the new folder.
        setFolders((prev) => [...prev, folderData]);
        setIsFolderModalOpen(false);
        setNewFolderName("");
      }
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 md:px-20">
      <div className="flex flex-col space-y-8 mt-10 md:mt-28">
        {/* Actions Section */}
        <div>
          <div className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
            Search for your{" "}
            <span className="text-indigo-700 dark:text-indigo-500">item(s)</span>.
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
              onClick={() => setIsFolderModalOpen(true)}
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
            <span className="text-indigo-700 dark:text-indigo-500">folders</span>.
          </div>
          <div className="flex flex-wrap gap-4">
            {filteredFolders.map((folder) => (
              <Link
                href={`/chats/folders/${folder.folderId}`}
                key={folder.folderId}
                className="p-4 w-full md:w-60 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 rounded-md shadow-lg flex flex-col cursor-pointer justify-between"
                onDrop={() => handleDrop(folder.folderId)}
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
                    {folder.folderName}
                  </h2>
                </div>
              </Link>
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
            {filteredChats.map((chat) => (
              <Link
                key={chat.chatId}
                href={`/chats/${chat.chatId}`}
                className="p-4 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 font-medium rounded-md shadow-md cursor-pointer"
                draggable
                onDragStart={() => handleDragStart(chat.chatId)}
              >
                <div className="truncate w-full text-lg font-bold">
                  {chat.chatName}
                </div>
                <div className="font-light text-sm">Created At: {new Date(chat.createdAt).toLocaleString()}</div>
                <div className="overflow-hidden">
                  <span className="text-sm font-medium text-gray-400">
                    Tags:{" "}
                  </span>
                  <div className="flex space-x-1 h-8 whitespace-nowrap no-scrollbar overflow-y-hidden">
                    {chat.tags && chat.tags.length > 0 ? (
                      chat.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-indigo-600 text-white text-xs px-3 py-2 rounded-md"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs py-2 text-gray-300 dark:text-gray-500">
                        No tags attached
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Folder Creation Modal */}
      {isFolderModalOpen && (
        <div
          onClick={() => setIsFolderModalOpen(false)}
          className="fixed inset-0 z-50 bg-black bg-opacity-75 flex justify-center items-center !m-0"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-4/5 lg:w-full max-w-md mx-auto"
          >
            <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-t bg-clip-text text-transparent from-indigo-400 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500">
              Create New Folder
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createFolder();
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
                  Folder Name
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter folder name..."
                  required
                  className="w-full px-4 py-2 border rounded-md shadow-md focus:outline-none focus:ring focus:border-indigo-500 dark:bg-gray-200"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-medium py-2 rounded-md hover:bg-indigo-700 focus:outline-none"
              >
                Create Folder
              </button>
              <button
                type="button"
                onClick={() => setIsFolderModalOpen(false)}
                className="w-full text-white font-medium py-2 rounded-md bg-gray-400 hover:bg-gray-500 dark:bg-gray-500 dark:hover:bg-gray-600 focus:outline-none mt-4"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatsPage;
