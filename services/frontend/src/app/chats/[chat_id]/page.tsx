// src/app/chats/new/page.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "system";
  timestamp: string;
}

const ExistingChat: React.FC = () => {
  const { chat_id } = useParams();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! How can I assist you today?",
      sender: "system",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [inputValue, setInputValue] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to handle sending a new message
  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;

    const currentTime = new Date().toLocaleTimeString();

    // Add the user's message
    const newMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
      timestamp: currentTime,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // Clear the input field
    setInputValue("");

    // Simulate a system response (e.g., typing back after a delay)
    setTimeout(() => {
      const systemMessage: Message = {
        id: messages.length + 2,
        text: "This is a simulated response.",
        sender: "system",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prevMessages) => [...prevMessages, systemMessage]);
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // Function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to the bottom whenever a new message is added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      <div className="hidden lg:flex lg:w-1/6 sm:p-4 sm:pt-12 sm:pb-20 md:pb-26 justify-end items-start">
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none flex items-center space-x-2">
          <span className="mr-1">Edit</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="#ffffff"
            strokeWidth="16"
            stroke="#ffffff"
            viewBox="0 0 494.936 494.936"
            className="w-4 h-4"
          >
            <path d="M389.844,182.85c-6.743,0-12.21,5.467-12.21,12.21v222.968c0,23.562-19.174,42.735-42.736,42.735H67.157 c-23.562,0-42.736-19.174-42.736-42.735V150.285c0-23.562,19.174-42.735,42.736-42.735h267.741c6.743,0,12.21-5.467,12.21-12.21 s-5.467-12.21-12.21-12.21H67.157C30.126,83.13,0,113.255,0,150.285v267.743c0,37.029,30.126,67.155,67.157,67.155h267.741 c37.03,0,67.156-30.126,67.156-67.155V195.061C402.054,188.318,396.587,182.85,389.844,182.85z" />
            <path d="M483.876,20.791c-14.72-14.72-38.669-14.714-53.377,0L221.352,229.944c-0.28,0.28-3.434,3.559-4.251,5.396l-28.963,65.069 c-2.057,4.619-1.056,10.027,2.521,13.6c2.337,2.336,5.461,3.576,8.639,3.576c1.675,0,3.362-0.346,4.96-1.057l65.07-28.963 c1.83-0.815,5.114-3.97,5.396-4.25L483.876,74.169c7.131-7.131,11.06-16.61,11.06-26.692 C494.936,37.396,491.007,27.915,483.876,20.791z M466.61,56.897L257.457,266.05c-0.035,0.036-0.055,0.078-0.089,0.107 l-33.989,15.131L238.51,247.3c0.03-0.036,0.071-0.055,0.107-0.09L447.765,38.058c5.038-5.039,13.819-5.033,18.846,0.005 c2.518,2.51,3.905,5.855,3.905,9.414C470.516,51.036,469.127,54.38,466.61,56.897z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ExistingChat;
