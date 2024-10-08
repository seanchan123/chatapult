// src/app/dashboard/page.tsx
'use client';

import Link from 'next/link';

const Home: React.FC = () => {

  return (
    <div className="h-screen bg-white dark:bg-gray-800 color-transition">
      {/* Hero Section */}
      <section className="w-full h-5/6 shadow-sm flex items-center justify-center bg-indigo-400 dark:bg-indigo-950 color-transition">
        <div className="text-center w-1/3 -mt-24">
          <div className="italic text-5xl dark:text-white">
            Launch your skills with AI dialogue using <span className="font-black text-indigo-700 dark:text-indigo-500">Chatapult</span>
          </div>
          <div className="mt-2 text-lg dark:text-gray-300">
            The ultimate AI chatbot platform
          </div>

          <div className="mt-16">
            <Link href="/register">
              <span className="px-6 py-4 rounded-md text-2xl text-white bg-indigo-600 hover:bg-indigo-700">
                    Get Started
                </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div >
        
      </div>
    </div>
  );
};

export default Home;