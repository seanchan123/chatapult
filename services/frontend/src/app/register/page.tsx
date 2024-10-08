// src/app/register/page.tsx
"use client";

import Link from "next/link";
import React, { useState, useContext } from "react";

import { AuthContext } from "@/contexts/AuthContext";

const RegisterPage: React.FC = () => {
  const { login } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      login(); // Sets cookie and redirects to the dashboard

      // const response = await fetch("/api/register", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ username, email, password }),
      // });

      // if (response.ok) {
      //   login(); // Sets cookie and redirects to the dashboard
      // } else {
      //   setError("Registration failed. Please try again.");
      // }
    } catch (err) {
      console.log(err);
      setError("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="overflow-hidden h-screen flex items-center justify-center bg-indigo-400 dark:bg-indigo-950">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md color-transition">
        <h1
          className="text-2xl font-bold text-center mb-6 bg-gradient-to-t bg-clip-text 
            text-transparent from-indigo-500 to-indigo-800 dark:from-indigo-300 dark:to-indigo-500"
        >
          Register
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
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-indigo-500"
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
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-medium py-2 rounded-md hover:bg-indigo-700 focus:outline-none"
          >
            Register
          </button>
        </form>
        <p className="text-sm text-center mt-4 text-gray-700 dark:text-gray-100">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-indigo-800 dark:text-indigo-500 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
