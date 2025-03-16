// src/app/page.tsx
"use client";

import Link from "next/link"
import React, { useContext } from "react";

import { AuthContext } from "@/contexts/AuthContext";

const Home: React.FC = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <div className="pt-24 h-screen bg-white dark:bg-gray-800 color-transition">
      {/* Hero Section */}
      <section className="w-full h-full sm:h-4/5 md:h-3/5 shadow-sm flex items-center justify-center bg-indigo-300 dark:bg-indigo-950 color-transition">
        <div className="text-center w-full sm:w-2/3 md:w-1/2 lg:w-1/3 -mt-4 sm:-mt-4 md:-mt-6">
          <div className="italic text-3xl sm:text-4xl md:text-5xl text-gray-800 dark:text-white">
            Launch your skills with AI dialogue using{" "}
            <span
              className="font-black bg-gradient-to-t bg-clip-text text-transparent
            from-indigo-600 to-indigo-900 dark:from-indigo-300 dark:to-indigo-600"
            >
              Chatapult.
            </span>
          </div>
          <div className="mt-2 font-light text-base sm:text-lg md:text-xl dark:text-gray-300">
            The ultimate AI chatbot platform
          </div>

          <div className="mt-8 sm:mt-12 md:mt-16">
            <Link href={`${isAuthenticated ? `/chats/new` : `/register`}`}>
              <span className="px-6 py-3 sm:px-8 sm:py-4 rounded-md text-md sm:text-lg text-white bg-indigo-600 hover:bg-indigo-700">
                Get Started
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div>{/* Add content here */}</div>
    </div>
  );
};

export default Home;
