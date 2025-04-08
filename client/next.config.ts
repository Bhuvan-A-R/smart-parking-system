const baseUrl = "http://192.168.29.67"; // Replace with your base URL or IP address
const ports = [3000, 5000]; // Add the ports you want to allow

// Generate allowed origins for both the base URL and localhost
const allowedOrigins = [
  ...ports.map((port) => `${baseUrl}:${port}`), // Add IP-based origins
  ...ports.map((port) => `http://localhost:${port}`), // Add localhost origins
];

const nextConfig = {
  experimental: {
    allowedDevOrigins: allowedOrigins, // Dynamically generated origins
  },
};

module.exports = nextConfig;