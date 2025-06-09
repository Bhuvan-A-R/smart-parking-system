"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function MaintenancePage() {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    // Show loader for 2 seconds, then show the main content
    const timer = setTimeout(() => setShowLoader(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-100 via-white to-blue-100 font-['Noto_Sans',sans-serif] px-2">
      {showLoader ? (
        <div className="flex flex-col items-center justify-center min-h-screen w-full">
          <span className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-base font-bold shadow-md mb-4">
            <svg
              className="w-6 h-6 mr-2 animate-spin"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              ></path>
            </svg>
            Maintenance in Progress
          </span>
        </div>
      ) : (
        <>
          {/* Animated SVG Illustration */}
          <div className="flex justify-center mb-6 w-full">
            <Image
              src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/maintenance/maintenance.svg"
              alt="Maintenance Illustration"
              width={220}
              height={180}
              priority
              className="mx-auto mt-20"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-orange-600 mb-3 uppercase tracking-wide drop-shadow text-center w-full">
            We'll Be Back Soon!
          </h1>
          <p className="text-gray-700 mb-2 text-base sm:text-lg font-semibold text-center w-full">
            Our site is currently undergoing scheduled maintenance to serve you
            better.
          </p>
          <p className="text-gray-500 mb-4 text-sm sm:text-base text-center w-full">
            We apologize for the inconvenience and appreciate your patience.
            <br />
            Please check back in a little while.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 mt-4 w-full">
            <span className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold shadow-sm">
              <svg
                className="w-4 h-4 mr-1 animate-spin"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
              Maintenance in Progress
            </span>
            <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold shadow-sm">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M18 13V7a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2v1H4a2 2 0 00-2 2v6a2 2 0 002 2h1v1a2 2 0 002 2h6a2 2 0 002-2v-1h1a2 2 0 002-2zM7 4h6v1H7V4zm6 12H7v-1h6v1zm3-3a1 1 0 01-1 1h-1v-2a1 1 0 00-1-1H6a1 1 0 00-1 1v2H4a1 1 0 01-1-1V7a1 1 0 011-1h1v2a1 1 0 001 1h8a1 1 0 001-1V6h1a1 1 0 011 1v6z" />
              </svg>
              We'll be back shortly!
            </span>
          </div>
          {/* Footer */}
          <footer className="w-full mt-6 flex-shrink-0">
            <div className="max-w-screen-xl mx-auto px-4 py-6">
              <p className="text-xs text-gray-400 text-center">
                © 2025 Smart Parking Management System. All rights reserved.
                <br />
                <span className="text-gray-500">
                  Designed and Developed by Bhuvan A R.
                </span>
              </p>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
