// src/app/chats/new/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState, useContext } from "react";

import { AuthContext } from "@/contexts/AuthContext";

// Define the Message interface.
interface Message {
  id: number;
  text: string;
  sender: "user" | "system";
  timestamp: string;
}

const NewChat: React.FC = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const router = useRouter();

  // State to hold the conversation messages.
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Welcome to your new chat. Ask a question to get started.",
      sender: "system",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [inputValue, setInputValue] = useState<string>("");
  const [streaming, setStreaming] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Utility function to scroll to bottom.
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Always call hooks in the same order.
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Scroll to the bottom on new messages.
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  // Utility function to generate a GUID.
  const generateGUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0,
        v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Function to call the AI Dialogue Service.
  const getAIResponse = async (query: string, stream: boolean): Promise<string> => {
    const url = process.env.NEXT_PUBLIC_AI_DIALOGUE_SERVICE_URL;
    if (!url) throw new Error("AI Dialogue Service URL not defined in env");
    const response = await fetch(url + "/chat", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_AI_DIALOGUE_SERVICE_API_KEY}`
      },
      body: JSON.stringify({ query, stream }),
    });
    if (!response.ok) {
      throw new Error("Failed to get AI response");
    }
    const data = await response.json();
    return data.response;
  };

  // Function to save the complete chat conversation.
  const saveChat = async () => {
    const url = process.env.NEXT_PUBLIC_AI_DATABASE_SERVICE_URL;
    if (!url) throw new Error("Database Service URL not defined in env");
    const chatId = generateGUID();
    const chatData = {
      userId: "unknown",
      folderId: "", // Initially no folder
      chatName: "New Chat",
      chatId,
      messages,
    };

    const response = await fetch(url + "/api/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(chatData),
    });

    if (!response.ok) {
      console.error("Failed to save chat");
    } else {
      console.log("Chat saved successfully");
    }
  };

  // Handler for sending a message.
  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return;
    const currentTime = new Date().toLocaleTimeString();

    // Append the user's message.
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
      timestamp: currentTime,
    };
    setMessages((prev) => [...prev, userMessage]);
    const query = inputValue; // Save the query before clearing input
    setInputValue("");

    try {
      // Call the AI Dialogue Service.
      const aiResponse = await getAIResponse(query, streaming);
      const systemMessage: Message = {
        id: messages.length + 2,
        text: aiResponse,
        sender: "system",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, systemMessage]);
      // Save the entire conversation in the database.
      await saveChat();
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const toggleStreaming = () => {
    setStreaming((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex flex-row justify-between p-4 space-x-4 pt-20">
      {/* Left Panel */}
      <div className="hidden lg:block lg:w-1/6 sm:p-4 sm:pt-14 sm:pb-22 md:pb-28">
        <Link
          href="/chats"
          className="px-4 py-3 rounded-md text-sm font-medium text-gray-800 hover:bg-indigo-400 dark:text-gray-100 dark:bg-transparent dark:hover:bg-indigo-900"
        >
          <span className="mr-1">{"⬅"}</span> Go to Chats
        </Link>
      </div>

      {/* Center (Chat) Panel */}
      <div className="flex-1 flex flex-col justify-between py-4 sm:p-4 rounded-lg">
        <div className="flex-1 overflow-y-auto pt-4 sm:p-4 sm:pb-16 md:pb-20">
          {/* Chat Message Area */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex w-full ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div className="flex flex-col items-start">
                <div className="text-xs text-gray-500 mt-4 mb-0.5">
                  {message.timestamp}
                </div>
                <div
                  className={`mb-4 p-4 max-w-md w-auto break-words ${
                    message.sender === "user"
                      ? "bg-indigo-600 text-white rounded-tl-xl rounded-tr-xl rounded-bl-xl"
                      : "bg-white text-gray-700 dark:bg-gray-600 dark:text-gray-100 rounded-tl-xl rounded-tr-xl rounded-br-xl"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            </div>
          ))}
          {/* Scroll to bottom reference */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Section */}
        <div className="fixed w-full md:w-2/3 lg:w-1/2 bottom-0 md:bottom-5 md:rounded-lg left-0 px-4 flex items-center space-x-4 p-4 rounded-none shadow-lg bg-white dark:bg-gray-700 md:left-1/2 transform md:-translate-x-1/2">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 p-2 rounded-md border focus:outline-none focus:ring focus:border-indigo-500 dark:border-gray-600"
          />
          <button
            onClick={handleSendMessage}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none"
          >
            Send
          </button>
        </div>
      </div>

      {/* Right Panel */}
      <div className="hidden lg:block lg:w-1/6 sm:p-4 sm:pt-14 sm:pb-22 md:pb-28">
        <button
          onClick={toggleStreaming}
          className="mt-0 px-4 py-3 rounded-md text-sm font-medium text-gray-800 hover:bg-indigo-400 dark:text-gray-100 dark:bg-transparent dark:hover:bg-indigo-900"
        >
        Streaming Response: {streaming ? "On" : "Off"}
      </button>
      </div>
    </div>
  );
};

export default NewChat;
