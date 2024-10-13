// src/app/chats/new/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "system";
  timestamp: string;
}

const NewChat: React.FC = () => {
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
    <div className="min-h-screen flex flex-col justify-between p-4">
      <div className="flex-1 mt-10 md:mt-28 overflow-y-auto p-4 pb-24 w-1/2 relative left-1/4">
        {/* Chat Message Area */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex w-full ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div className="flex flex-col items-start">
              <div className="text-xs text-gray-500 mb-1">
                {message.timestamp}
              </div>
              <div
                className={`mb-4 p-4 max-w-md w-auto ${
                  message.sender === "user"
                    ? "bg-indigo-600 text-white rounded-tl-xl rounded-tr-xl rounded-bl-xl"
                    : "bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-100 rounded-tl-xl rounded-tr-xl rounded-br-xl"
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
      <div className="fixed w-full md:w-1/2 bottom-5 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 p-4 rounded-lg shadow-lg bg-white dark:bg-gray-700">
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
  );
};

export default NewChat;
