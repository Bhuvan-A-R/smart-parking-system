"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function RegisterPage() {
  const [step, setStep] = useState(1); // Step 1: Register, Step 2: Verify OTP
  const [userId, setUserId] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [notification, setNotification] = useState(null); // Notification state
  const router = useRouter();

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000); // Auto-hide after 3 seconds
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://192.168.29.67:5000/api/auth/register", {
        name,
        email,
        password,
      });

      showNotification("OTP sent to your email", "success");
      setUserId(res.data.userId);
      setStep(2); // Move to OTP verification step
    } catch (err) {
      showNotification(err.response?.data?.message || "Registration failed", "error");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/verify-otp", {
        userId,
        otp,
      });

      showNotification("Email verified successfully!", "success");
      router.push("/login");
    } catch (err) {
      showNotification(err.response?.data?.message || "OTP verification failed", "error");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-500 to-blue-100 px-4 sm:px-6 lg:px-8">
      {/* Notification Popover */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
            notification.type === "success"
              ? "bg-green-500 text-white animate-fade-in-out"
              : "bg-red-500 text-white animate-fade-in-out"
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="bg-white shadow-2xl rounded-2xl p-8 sm:p-10 w-full max-w-sm sm:max-w-md lg:max-w-lg">
        {step === 1 ? (
          <>
            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-800 mb-6">
              Create an Account
            </h2>
            <p className="text-center text-gray-600 mb-8">
              Register to access the Smart Parking System.
            </p>

            {/* Registration Form */}
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
              >
                Register
              </button>
            </form>
          </>
        ) : (
          <>
            {/* OTP Verification */}
            <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-800 mb-6">
              Verify OTP
            </h2>
            <p className="text-center text-gray-600 mb-8">
              Enter the OTP sent to your email.
            </p>
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
              >
                Verify OTP
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
