"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import AuthLayout from "../components/AuthLayout";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function VerifyOtpClient() {
  const [otp, setOtp] = useState("");
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
        userId,
        otp,
      });
      showNotification(
        "Email verified successfully! You can now log in.",
        "success"
      );
      router.push("/login");
    } catch (err) {
      showNotification(
        err.response?.data?.message || "OTP verification failed",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Verify OTP" notification={notification}>
      <p className="text-center text-gray-600 mb-6">
        Please check your inbox or spam folder to find the OTP and verify your
        account.
      </p>
      <form onSubmit={handleVerifyOtp} className="space-y-6">
        <div>
          <label
            htmlFor="otp"
            className="block text-sm font-medium text-black mb-2"
          >
            OTP
          </label>
          <input
            id="otp"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            required
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
          disabled={isLoading}
        >
          {isLoading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
    </AuthLayout>
  );
}