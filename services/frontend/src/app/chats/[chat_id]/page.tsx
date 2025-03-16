// src/app/chats/[chat_id]/page.tsx
"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import { AuthContext } from "@/contexts/AuthContext";

interface Message {
  id: string;
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

interface ChatResponse {
  chatName: string;
  folderId: string;
  messages: Message[];
  tags: string[];
}

const ExistingChat: React.FC = () => {
  const { isAuthenticated, user } = React.useContext(AuthContext);
  const router = useRouter();
  const { chat_id } = useParams() as { chat_id: string };
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editText, setEditText] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [streaming, setStreaming] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Chat information
  const [chatName, setChatName] = useState<string>("");
  const [folderId, setFolderId] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);

  // Utility function to scroll to the bottom of the chat
  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Fetch the chat conversation from the database.
  useEffect(() => {
    const fetchChat = async (): Promise<void> => {
      try {
        const url = process.env.NEXT_PUBLIC_DATABASE_SERVICE_URL;
        if (!url) throw new Error("Database Service URL not defined in env");
  
        const response = await fetch(`${url}/api/chats/${chat_id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user?.token}`,
          },
        });
  
        if (response.ok) {
          const data: ChatResponse = await response.json();

          const loadedMessages: Message[] = data.messages.map((m: Message) => ({
            id: m.id,
            text: m.text,
            sender: m.sender,
            timestamp: new Date(m.timestamp),
          }));
          const folderId = data.folderId;
          const chatName = data.chatName;
          const tags = data.tags;

          setMessages(loadedMessages);
          setFolderId(folderId);
          setChatName(chatName);
          setTags(tags);
        } else {
          console.error("Failed to fetch chat");
        }
      } catch (error) {
        console.error("Error fetching chat:", error);
      }
    };
  
    // Call fetchChat if the user is authenticated
    if (isAuthenticated) {
      fetchChat();
    }
    // The dependency array includes isAuthenticated, chat_id, and user?.token
  }, [isAuthenticated, chat_id, user?.token]);
  
  // Scroll to the bottom whenever messages change
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

  // Streaming response call
  const getAIResponseStream = async (
    query: string,
    history: Message[]
  ): Promise<string> => {
    const url = process.env.NEXT_PUBLIC_AI_DIALOGUE_SERVICE_URL;
    if (!url) throw new Error("AI Dialogue Service URL not defined in env");

    const response = await fetch(url + "/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_AI_DIALOGUE_SERVICE_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        history: history.map((m) => ({ sender: m.sender, text: m.text })),
        stream: true,
      }),
    });
    if (!response.ok) {
      throw new Error(`Streaming request failed with status ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("ReadableStream not supported");
    const decoder = new TextDecoder("utf-8");
    let done = false;
    let accumulated = "";
    let buffer = "";

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        // Append the new decoded text to the buffer
        buffer += decoder.decode(value, { stream: !doneReading });
        // Split buffer into lines
        const lines = buffer.split("\n");
        // Keep the last line (possibly incomplete) in the buffer
        buffer = lines.pop() || "";
        // Process all complete lines
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;
          if (trimmedLine.startsWith("data:")) {
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
              setMessages((prev) => {
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
              await new Promise((resolve) => setTimeout(resolve, 0));
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
  const getAIResponse = async (
    query: string,
    history: Message[]
  ): Promise<string> => {
    const url = process.env.NEXT_PUBLIC_AI_DIALOGUE_SERVICE_URL;
    if (!url) throw new Error("AI Dialogue Service URL not defined in env");

    const response = await fetch(url + "/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_AI_DIALOGUE_SERVICE_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        history: history.map((m) => ({ sender: m.sender, text: m.text })),
        stream: false,
      }),
    });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data.response;
  };

  // PUT updated chat conversation to the database.
  const updateChat = async (conversation: Message[]): Promise<void> => {
    try {
      const url = process.env.NEXT_PUBLIC_DATABASE_SERVICE_URL;
      if (!url) throw new Error("Database Service URL not defined in env");

      const chatData = {
        messages: conversation.map((m) => ({
          ...m,
          timestamp: new Date(m.timestamp).toISOString(),
        })),
      };

      const response = await fetch(`${url}/api/chats/${chat_id}/messages`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token}`,
        },
        body: JSON.stringify(chatData),
      });

      if (!response.ok) {
        console.error("Failed to update chat");
      } else {
        console.log("Chat updated successfully");
      }
    } catch (error) {
      console.error("Error updating chat:", error);
    }
  };

  // Handler for sending a new message.
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const currentTime = new Date();

    // Append user's message
    const userMessage: Message = {
      id: generateGUID(),
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
      id: generateGUID(),
      text: "Loading...",
      sender: "system",
      timestamp: new Date(),
    };

    // Append the placeholder to state (only once)
    const updatedConversation = [...updatedAfterUser, placeholderSystemMessage];
    setMessages(updatedConversation);

    try {
      let finalResponse = "";
      if (!streaming) {
        finalResponse = await getAIResponse(userQuery, updatedAfterUser);
      } else {
        finalResponse = await getAIResponseStream(userQuery, updatedAfterUser);
      }
      // Build final conversation array using the final response.
      const finalConversation = [
        ...updatedAfterUser,
        { ...placeholderSystemMessage, text: finalResponse, timestamp: new Date() },
      ];
      setMessages(finalConversation);
      await updateChat(finalConversation);
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
  
  // Handle modal open/close
  const handleEditClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  // Handle form submit in the modal
  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-row justify-between p-4 space-x-4 pt-20">
      {/* Left Panel */}
      <div className="hidden lg:block lg:w-1/6 sm:p-4 sm:pt-14 sm:pb-22 md:pb-28">
        {folderId ? (
          <Link
            href={`/chats/folders/${folderId}`}
            className="px-4 py-3 rounded-md text-sm font-medium text-gray-800 hover:bg-indigo-400 dark:text-gray-100 dark:bg-transparent dark:hover:bg-indigo-900"
          >
            <span className="mr-1">{"⬅"}</span> Go to Folder
          </Link>
        ) : (
          <Link
            href="/chats"
            className="px-4 py-3 rounded-md text-sm font-medium text-gray-800 hover:bg-indigo-400 dark:text-gray-100 dark:bg-transparent dark:hover:bg-indigo-900"
          >
            <span className="mr-1">{"⬅"}</span> Go to Chats
          </Link>
        )}
      </div>

      {/* Center (Chat) Panel */}
      <div className="flex-1 flex flex-col justify-between py-4 sm:p-4 rounded-lg">
        <div className="flex-1 overflow-y-auto pt-4 sm:p-4 sm:pb-16 md:pb-20">
          {/* Chat Message Area */}
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
                  {message.sender === "system" && message.text === "Loading..." ? (
                    <em>{message.text}</em>
                  ) : (
                    message.text
                  )}
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
        <button
          onClick={handleEditClick}
          className="mt-0.5 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none flex items-center space-x-2"
        >
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
        <button
          onClick={toggleStreaming}
          className="mt-0 px-4 py-3 rounded-md text-sm font-medium text-gray-800 hover:bg-indigo-400 dark:text-gray-100 dark:bg-transparent dark:hover:bg-indigo-900"
        >
          Streaming Response: {streaming ? "On" : "Off"}
        </button>
      </div>

      {/* Modal for Editing Chat Details */}
      {isModalOpen && (
        <div onClick={handleModalClose} className="fixed inset-0 z-50 bg-black bg-opacity-75 flex justify-center items-center !m-0">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-4/5 lg:w-full max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-t bg-clip-text text-transparent from-indigo-400 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500">
              Edit Chat
            </h2>
            <form onSubmit={handleModalSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
                  Chat ID
                </label>
                <input
                  type="text"
                  value={chat_id}
                  disabled
                  className="w-full px-4 py-2 border rounded-md shadow-md focus:outline-none focus:ring focus:border-indigo-500 dark:bg-gray-200"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
                  Edit Message
                </label>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md shadow-md focus:outline-none focus:ring focus:border-indigo-500 dark:bg-gray-200"
                  placeholder="Edit your chat message here..."
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
                onClick={handleModalClose}
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

export default ExistingChat;
