"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const checkLoginStatus = () => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
    setIsLoggedIn(!!token);
  };

  useEffect(() => {
    checkLoginStatus();

    const interval = setInterval(() => {
      checkLoginStatus();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    setIsLoggedIn(false);
    router.push("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-[#F1F1F1] shadow-md z-50">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8"
          aria-label="Global"
        >
          {/* Logo and Name Section */}
          <div className="flex items-center lg:flex-1">
            <Link href="/" className="flex items-center space-x-2 group">
              <img
                className="h-10 w-auto transition-transform duration-300 group-hover:scale-110"
                src="/logo.png"
                alt="Easy Parkers Logo"
              />
              <span className="text-xl font-bold">
                <span className="text-black group-hover:text-gray-700 transition-colors duration-300">
                  Easy
                </span>{" "}
                <span className="text-red-600 group-hover:text-red-400 transition-colors duration-300">
                  Parkers
                </span>
              </span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={toggleMenu}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-[#23120B] hover:bg-gray-200 transition-colors duration-300"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex lg:gap-x-12">
            <Link
              href="/features"
              className="text-sm font-semibold text-[#21209C] hover:text-[#FDB827] transition-colors duration-300"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-semibold text-[#21209C] hover:text-[#FDB827] transition-colors duration-300"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="text-sm font-semibold text-[#21209C] hover:text-[#FDB827] transition-colors duration-300"
            >
              About
            </Link>
          </div>

          {/* User Actions */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="text-sm font-semibold text-[#21209C] hover:text-[#FDB827] transition-colors duration-300"
              >
                Log out
              </button>
            ) : (
              <Link
                href="/login"
                className="text-sm font-semibold text-[#21209C] hover:text-[#FDB827] transition-colors duration-300"
              >
                Log in
              </Link>
            )}
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white shadow-md">
            <div className="flex flex-col items-center space-y-4 px-6 pb-6">
              <Link
                href="/features"
                className="mt-5 block text-lg font-semibold text-[#21209C] hover:text-[#FDB827] transition-colors duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="block text-lg font-semibold text-[#21209C] hover:text-[#FDB827] transition-colors duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className="block text-lg font-semibold text-[#21209C] hover:text-[#FDB827] transition-colors duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block text-lg font-semibold text-[#21209C] hover:text-[#FDB827] transition-colors duration-300"
                >
                  Log out
                </button>
              ) : (
                <Link
                  href="/login"
                  className="block text-lg font-semibold text-[#21209C] hover:text-[#FDB827] transition-colors duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log in
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
