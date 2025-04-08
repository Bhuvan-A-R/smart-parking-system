"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function DashboardPage() {
  interface User {
    name: string;
    email: string;
    id: string;
  }

  const [user, setUser] = useState<User | null>(null); // State to store user details

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        // Retrieve token from cookies
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1];

        if (!token) {
          alert("No token found. Redirecting to login...");
          window.location.href = "/login"; // Redirect to login if no token
          return;
        }

        // Fetch user details using the token
        const res = await axios.get("http://192.168.29.67:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data); // Set user details
      } catch (err) {
        console.error("Failed to fetch user details:", err);
        alert("Session expired. Redirecting to login...");
        window.location.href = "/login"; // Redirect to login on error
      }
    };

    fetchUserDetails();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-green-500 to-green-100 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-2xl rounded-2xl p-8 sm:p-10 w-full max-w-sm sm:max-w-md lg:max-w-lg">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-800 mb-6">
          Dashboard
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Welcome to your dashboard. Here are your details:
        </p>

        {user ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Name:</span>
              <span className="text-gray-900">{user.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Email:</span>
              <span className="text-gray-900">{user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">User ID:</span>
              <span className="text-gray-900">{user.id}</span>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">Loading user details...</p>
        )}
      </div>
    </div>
  );
}
