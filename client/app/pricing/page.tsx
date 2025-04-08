export default function PricingPage() {
  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-500 to-blue-100 px-4 sm:px-6 lg:px-8"
    >
      <div className="bg-white shadow-2xl rounded-2xl p-8 sm:p-10 w-full max-w-sm sm:max-w-md lg:max-w-lg">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-800 mb-6">
          Pricing
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Choose a plan that fits your parking needs.
        </p>
        <div className="space-y-6">
          <div className="bg-gray-100 p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-blue-600">Basic Plan</h3>
            <p className="text-gray-600">₹50/hour</p>
            <p className="text-gray-600">Access to basic parking spots.</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-blue-600">Premium Plan</h3>
            <p className="text-gray-600">₹100/hour</p>
            <p className="text-gray-600">Priority parking and premium spots.</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-blue-600">Enterprise Plan</h3>
            <p className="text-gray-600">Custom Pricing</p>
            <p className="text-gray-600">For businesses and parking administrators.</p>
          </div>
        </div>
      </div>
    </div>
  );
}