// src/app/dashboard/page.tsx
"use client";

import Link from "next/link";

const Home: React.FC = () => {
  return (
    <div className="h-screen bg-white dark:bg-gray-800 color-transition">
      {/* Hero Section */}
      <section className="w-full h-5/6 shadow-sm flex items-center justify-center bg-indigo-400 dark:bg-indigo-950 color-transition">
        <div className="text-center w-full sm:w-2/3 md:w-1/2 lg:w-1/3 -mt-12 sm:-mt-16 md:-mt-24">
          <div className="italic text-3xl sm:text-4xl md:text-5xl dark:text-white">
            Launch your skills with AI dialogue using{" "}
            <span className="font-black text-indigo-700 dark:text-indigo-500">
              Chatapult
            </span>
          </div>
          <div className="mt-2 text-base sm:text-lg md:text-xl dark:text-gray-300">
            The ultimate AI chatbot platform
          </div>

          <div className="mt-8 sm:mt-12 md:mt-16">
            <Link href="/register">
              <span className="px-4 py-3 sm:px-5 sm:py-4 rounded-md text-xl sm:text-2xl text-white bg-indigo-600 hover:bg-indigo-700">
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
