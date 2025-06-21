const baseUrl = [
      "http://localhost:5000",
      "https://easy-parkers-sps.vercel.app/", // <-- add your production frontend URL here
      "https://npx0wrxr-3000.inc1.devtunnels.ms:3000/"]; // Updated to use localhost
const ports = [3000, 5000]; // Add the ports you want to allow

// Generate allowed origins for both the base URL and localhost
const allowedOrigins = [
  ...ports.map((port) => `${baseUrl}:${port}`), // Add localhost origins
];

const nextConfig = {
  experimental: {
    allowedDevOrigins: allowedOrigins, // Dynamically generated origins
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: 
      "https://easy-parkers-sps.vercel.app/api/:path*" // Update this to your backend URL
      },
    ];
  },
};

module.exports = nextConfig;