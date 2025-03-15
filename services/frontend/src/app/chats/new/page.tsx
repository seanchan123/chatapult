// src/app/chats/new/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState, useContext } from "react";

import { AuthContext } from "@/contexts/AuthContext";

interface Message {
  id: number;
  text: string;
  sender: "user" | "system";
  timestamp: Date;
}

interface ChatCompletionChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  service_tier: string;
  system_fingerprint: string;
  choices: Array<{
    index: number;
    delta: {
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

const NewChat: React.FC = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Welcome to your new chat. Ask a question to get started.",
      sender: "system",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState<string>("");
  const [streaming, setStreaming] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom utility
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  // Utility function to generate a GUID
  const generateGUID = (): string => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  // Streaming response reader
  const getAIResponseStream = async (query: string): Promise<string> => {
    const url = process.env.NEXT_PUBLIC_AI_DIALOGUE_SERVICE_URL;
    if (!url) throw new Error("AI Dialogue Service URL not defined in env");
  
    const response = await fetch(url + "/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_AI_DIALOGUE_SERVICE_API_KEY}`,
      },
      body: JSON.stringify({ query, stream: true }),
    });
    if (!response.ok) {
      throw new Error(`Streaming request failed with status ${response.status}`);
    }
  
    const reader = response.body?.getReader();
    if (!reader) throw new Error("ReadableStream not supported");
    const decoder = new TextDecoder("utf-8");
    let done = false;
    let accumulated = "";
  
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        const rawString = decoder.decode(value, { stream: !doneReading });
        const lines = rawString.split("\n");
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;
          if (trimmedLine.startsWith("data:")) {
            // Remove the 'data:' prefix
            const jsonString = trimmedLine.slice("data:".length).trim();
            if (jsonString === "[DONE]") {
              done = true;
              break;
            }
            try {
              const parsed: ChatCompletionChunk = JSON.parse(jsonString);
              const content = parsed.choices?.[0]?.delta?.content || "";
              accumulated += content;
              // Update the UI by modifying the last message (placeholder) with accumulated text.
              setMessages(prev => {
                const updated = [...prev];
                if (updated.length > 0) {
                  updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    text: accumulated,
                    timestamp: new Date(),
                  };
                }
                return updated;
              });
              // Yield control for UI update.
              await new Promise(resolve => setTimeout(resolve, 0));
            } catch (err) {
              console.error("Error parsing JSON:", err, "from line:", trimmedLine);
            }
          }
        }
      }
    }
    return accumulated;
  };

  // Non-streaming response call
  const getAIResponse = async (query: string): Promise<string> => {
    const url = process.env.NEXT_PUBLIC_AI_DIALOGUE_SERVICE_URL;
    if (!url) throw new Error("AI Dialogue Service URL not defined in env");

    const response = await fetch(url + "/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_AI_DIALOGUE_SERVICE_API_KEY}`,
      },
      body: JSON.stringify({ query, stream: false }),
    });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data.response;
  };

  // Save the conversation to the database (POST for new chat)
  const saveChat = async (conversation: Message[]): Promise<string> => {
    const url = process.env.NEXT_PUBLIC_DATABASE_SERVICE_URL;
    if (!url) throw new Error("Database Service URL not defined in env");

    const chatId = generateGUID();
    const currentTimestamp = new Date().toISOString();
    const chatData = {
      userId: user?.username || "unknown",
      folderId: "",
      chatName: `Chat (${currentTimestamp})`,
      chatId,
      messages: conversation.map((m) => ({
        ...m,
        timestamp: m.timestamp.toISOString(),
      })),
    };

    const res = await fetch(url + "/api/chats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${user?.token}`,
      },
      body: JSON.stringify(chatData),
    });
    if (!res.ok) {
      console.error("Failed to save chat");
      throw new Error("Failed to save chat");
    } else {
      console.log("Chat saved successfully");
      return chatId;
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const currentTime = new Date();

    // Append user's message
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
      timestamp: currentTime,
    };
    const updatedAfterUser = [...messages, userMessage];
    setMessages(updatedAfterUser);
    const userQuery = inputValue;
    setInputValue("");

    // Add placeholder for AI response
    const placeholderSystemMessage: Message = {
      id: updatedAfterUser.length + 1,
      text: "",
      sender: "system",
      timestamp: new Date(),
    };

    // Append the placeholder to state (only once)
    const updatedConversation = [...updatedAfterUser, placeholderSystemMessage];
    setMessages(updatedConversation);

    try {
      let finalResponse = "";
      if (!streaming) {
        finalResponse = await getAIResponse(userQuery);
      } else {
        finalResponse = await getAIResponseStream(userQuery);
      }
      // Build final conversation array using the final response.
      const finalConversation = [
        ...updatedAfterUser,
        { ...placeholderSystemMessage, text: finalResponse, timestamp: new Date() },
      ];
      setMessages(finalConversation);
      const newChatId = await saveChat(finalConversation);
      router.push(`/chats/${newChatId}`);
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
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
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex w-full ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className="flex flex-col items-start">
                <div className="text-xs text-gray-500 mt-4 mb-0.5">
                  {new Date(message.timestamp).toLocaleTimeString()}
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
