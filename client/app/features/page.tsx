export default function FeaturesPage() {
  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-500 to-blue-100 px-4 sm:px-6 lg:px-8"
    >
      <div className="bg-white shadow-2xl rounded-2xl p-8 sm:p-10 w-full max-w-sm sm:max-w-md lg:max-w-lg">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-800 mb-6">
          Features
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Explore the core functionalities of the Smart Parking Management System.
        </p>
        <ul className="space-y-6">
          <li className="bg-gray-100 p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-blue-600">User Authentication</h3>
            <p className="text-gray-600">
              Secure login for drivers and parking administrators.
            </p>
          </li>
          <li className="bg-gray-100 p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-blue-600">Real-Time Slot Availability</h3>
            <p className="text-gray-600">
              Check and book available parking spots in real-time.
            </p>
          </li>
          <li className="bg-gray-100 p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-blue-600">Automated Billing</h3>
            <p className="text-gray-600">
              Calculate parking fees automatically based on duration.
            </p>
          </li>
        </ul>
      </div>
    </div>
  );
}