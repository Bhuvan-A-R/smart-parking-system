import Link from "next/link";
import "./globals.css";

export default function HomePage() {
  return (
    <>
      <div
        className="flex items-center justify-center min-h-screen bg-cover bg-center px-4"
        style={{
          backgroundImage: "url('/background.png')", // Replace with your background image path
        }}
      >
        <div className="bg-white bg-opacity-80 p-6 sm:p-8 rounded-lg shadow-lg text-center w-full max-w-sm sm:max-w-md lg:max-w-xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">
            Welcome to <span className="text-blue-600">Smart Parking System</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
            Manage parking efficiently with our modern platform.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/login"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition text-sm sm:text-base"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition text-sm sm:text-base"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
      <footer className="bg-gray-800 text-white py-4 text-center">
        <p>&copy; 2025 Smart Parking Management System. All rights reserved.</p>
        <p className="mt-2">
          Designed and Developed by{" "}
          <a
            href="https://www.linkedin.com/in/bhuvan-a-r" // Replace with your LinkedIn profile URL
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition"
          >
            Bhuvan A R
          </a>
          .
        </p>
      </footer>
    </>
  );
}