// src/app/login/page.tsx
"use client";

import Link from "next/link";
import React, { useState, useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";

const LoginPage: React.FC = () => {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const { token } = data; // Assume the server returns a token
        login(token); // Pass the JWT token to the login function
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="overflow-hidden h-screen flex items-center justify-center bg-indigo-400 dark:bg-indigo-950">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-4/5 lg:w-full max-w-md color-transition">
        <h1
          className="text-2xl font-bold text-center mb-6 bg-gradient-to-t bg-clip-text 
            text-transparent from-indigo-400 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500"
        >
          Login
        </h1>

        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md shadow-md focus:outline-none focus:ring focus:border-indigo-500 dark:bg-gray-200"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md shadow-md focus:outline-none focus:ring focus:border-indigo-500 dark:bg-gray-200"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-medium py-2 rounded-md hover:bg-indigo-700 focus:outline-none"
          >
            Login
          </button>
        </form>
        <p className="text-sm text-center mt-4 text-gray-700 dark:text-gray-100">
          Don&#39;t have an account?{" "}
          <Link
            href="/register"
            className="text-indigo-800 dark:text-indigo-500 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
