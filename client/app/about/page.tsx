export default function AboutPage() {
  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-500 to-blue-100 px-4 sm:px-6 lg:px-8"
    >
      <div className="bg-white shadow-2xl rounded-2xl p-8 sm:p-10 w-full max-w-sm sm:max-w-md lg:max-w-lg">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-800 mb-6">
          About Us
        </h2>
        <p className="text-center text-gray-600">
          The Smart Parking Management System is designed to simplify parking for drivers and administrators. 
          With real-time slot availability, automated billing, and an admin dashboard, we aim to make parking 
          management efficient and hassle-free.
        </p>
      </div>
    </div>
  );
}