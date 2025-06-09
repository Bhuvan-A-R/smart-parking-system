"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

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
              <Image
                className="h-10 w-auto transition-transform duration-300 group-hover:scale-110"
                src="/logo.png"
                alt="Easy Parkers Logo"
                width={40}
                height={40}
                priority
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

          {/* Navigation Links and User Actions removed for maintenance mode */}
        </nav>
      </header>
    </>
  );
}
