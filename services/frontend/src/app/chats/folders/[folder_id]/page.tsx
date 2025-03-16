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

const ChatsPage: React.FC = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const router = useRouter();
  const { folder_id } = useParams() as { folder_id: string };
  const [search, setSearch] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);

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

      fetchChats();
    }
  }, [isAuthenticated, router, folder_id, user?.username, user?.token]);
  
  if (!isAuthenticated) {
    return null;
  }

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
              className="w-full md:w-4/5 py-2 px-4 border rounded-md shadow-md focus:outline-none focus:ring focus:border-indigo-500 dark:bg-gray-200"
            />
            <Link
              href="/chats/new"
              className="w-full md:w-1/5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-md text-center focus:outline-none"
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
            {chats.map((chat) => (
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
    </div>
  );
};

export default ChatsPage;
