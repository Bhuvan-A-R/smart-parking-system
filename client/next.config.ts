const baseUrl = "https://easy-parkers-sps.vercel.app/";
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