// src/app/layout.tsx

import React from "react";
import { Roboto } from "next/font/google";

import "@/styles/globals.css";
import Header from "@/components/layout/Header";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata = {
  title: "Chatapult",
  description: "Launch Your Skills With AI Dialogue",
};

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="en">
      <body className={`${roboto.className} bg-gray-50`}>
        <AuthProvider>
          <Header />
          <main className="bg-indigo-300 dark:bg-indigo-950 color-transition">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
};

export default RootLayout;
