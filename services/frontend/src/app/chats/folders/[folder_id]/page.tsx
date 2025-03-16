// src/app/chats/folders/[folder_id]/page.tsx
"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";

import { AuthContext } from "@/contexts/AuthContext";

interface Chat {
  chatId: string;
  chatName: string;
  createdAt: string;
  tags: string[];
}

const FolderPage: React.FC = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const router = useRouter();
  const { folder_id } = useParams() as { folder_id: string };
  const [search, setSearch] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [folderName, setFolderName] = useState("");
  const [folderCreatedAt, setFolderCreatedAt] = useState("");

  // State for folder modal
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      // Fetch chats from the database filtering by username.
      const fetchChats = async () => {
        try {
          const url = process.env.NEXT_PUBLIC_DATABASE_SERVICE_URL;
          if (!url) throw new Error("Database Service URL not defined in env");
          const response = await fetch(
            `${url}/api/chats?username=${user?.username}&folderId=${folder_id}`,
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

      // Fetch folder name from the database
      const fetchFolder = async () => {
        try {
          const url = process.env.NEXT_PUBLIC_DATABASE_SERVICE_URL;
          if (!url) throw new Error("Database Service URL not defined in env");
          const response = await fetch(
            `${url}/api/folders/${folder_id}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user?.token}`,
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            setFolderName(data.folderName);
            setFolderCreatedAt(data.createdAt);
          } else {
            console.error("Failed to fetch folder name");
          }
        } catch (error) {
          console.error("Error fetching folder name:", error);
        }
      };

      fetchChats();
      fetchFolder();
      setNewFolderName(folderName);
    }
  }, [isAuthenticated, router, folder_id, folderName, user?.username, user?.token]);
  
  if (!isAuthenticated) {
    return null;
  }

  // Compute filtered chats using the search term.
  const lowerCaseSearch = search.trim().toLowerCase();
  const filteredChats = lowerCaseSearch
    ? chats.filter((chat) =>
        chat.chatName.toLowerCase().includes(lowerCaseSearch)
      )
    : chats;

  // Edit current folder
  const editFolder = async () => {
    try {
      const url = process.env.NEXT_PUBLIC_DATABASE_SERVICE_URL;
      if (!url) throw new Error("Database Service URL not defined in env");
      const folderData = {
        folderName: newFolderName,
      };
      const response = await fetch(`${url}/api/folders/${folder_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token}`,
        },
        body: JSON.stringify(folderData),
      });
      if (!response.ok) {
        console.error("Failed to update folder");
      } else {
        console.log("Folder updated successfully");
        setIsFolderModalOpen(false);
      }
    } catch (error) {
      console.error("Error updating folder:", error);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 md:px-20">
      <div className="flex flex-col space-y-8 mt-10 md:mt-28">
        {/* Back Button */}
        <div>
          <Link
            href="/chats"
            className="px-4 py-3 rounded-md text-sm font-medium text-gray-800 hover:bg-indigo-400 dark:text-gray-100 dark:bg-transparent dark:hover:bg-indigo-900"
          >
            <span className="mr-1">{"⬅"}</span> Go to Chats
          </Link>
        </div>

        {/* Folder Info */}
        <div className="flex flex-col space-y-4 text-center">
          <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            {newFolderName}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-300">
            Created At: {new Date(folderCreatedAt).toLocaleString()}
          </div>
        </div>

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
              Edit Folder
            </button>
            <Link
              href={`/chats/new?folderId=${folder_id}`}
              className="w-full md:w-1/6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-md text-center focus:outline-none"
            >
              New Chat
            </Link>
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

      {/* Folder Edit Modal */}
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
              Edit Current Folder
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                editFolder();
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
                Save Changes
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

export default FolderPage;
