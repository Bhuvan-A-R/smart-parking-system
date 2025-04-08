export default function Features() {
  return (
    <div className="py-12 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-8">
          Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-blue-600 mb-4">
              User Authentication
            </h3>
            <p className="text-gray-600">
              Secure login for drivers and parking administrators to manage accounts.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-blue-600 mb-4">
              Real-Time Slot Availability
            </h3>
            <p className="text-gray-600">
              Check and book available parking spots in real-time.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-blue-600 mb-4">
              Automated Billing
            </h3>
            <p className="text-gray-600">
              Calculate parking fees automatically based on duration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}