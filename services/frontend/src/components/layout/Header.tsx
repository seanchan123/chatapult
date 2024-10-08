// src/components/layout/Header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useState, useContext } from "react";

import ThemeToggle from "@/common/ThemeToggle";
import { AuthContext } from "@/contexts/AuthContext";

const Header: React.FC = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useContext(AuthContext);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (href: string) => pathname === href;

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="font-roboto bg-white shadow-sm fixed w-full z-50 dark:bg-gray-800 color-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24 items-center">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" aria-label="Home">
              <span className="flex items-center">
                <Image
                  src="/assets/images/logo.svg"
                  alt="Logo"
                  className="text-indigo-700 dark:text-indigo-500"
                  width={75}
                  height={75}
                />
                <span className="font-bold text-3xl tracking-wide text-gray-800 dark:text-white">
                  Chatapult
                </span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:space-x-8">
            <Link href="/">
              <span
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive("/")
                    ? "border-indigo-700 text-gray-900 dark:text-gray-100 dark:border-indigo-500"
                    : "border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white"
                }`}
              >
                Home
              </span>
            </Link>
            <Link href="/dashboard">
              <span
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive("/dashboard")
                    ? "border-indigo-700 text-gray-900 dark:text-gray-100 dark:border-indigo-500"
                    : "border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white"
                }`}
              >
                Dashboard
              </span>
            </Link>
          </div>

          {/* Authentication Links */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            ) : (
              <>
                <Link href="/login">
                  <span className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-100 dark:bg-transparent dark:hover:bg-gray-700">
                    Login
                  </span>
                </Link>
                <Link href="/register">
                  <span className="px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                    Sign Up
                  </span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <div className="px-4 py-2 border-gray-200 dark:border-gray-600">
              <ThemeToggle />
            </div>
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              {!isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                // Icon when menu is open
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div
          className="md:hidden transition-all duration-300 ease-in-out"
          id="mobile-menu"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/">
              <span
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive("/")
                    ? "bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-500 dark:border-indigo-500 dark:text-indigo-50"
                    : "text-gray-600 dark:text-white"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </span>
            </Link>
            <Link href="/dashboard">
              <span
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive("/dashboard")
                    ? "bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-500 dark:border-indigo-500 dark:text-indigo-50"
                    : "text-gray-600 dark:text-white"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </span>
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-600">
            <div className="px-2 space-y-1">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link href="/login">
                    <span
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </span>
                  </Link>
                  <Link href="/register">
                    <span
                      className="block px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
