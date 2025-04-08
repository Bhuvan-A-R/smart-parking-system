export default function Pricing() {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-8">
          Pricing
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-gray-100 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-blue-600 mb-4">Basic Plan</h3>
            <p className="text-gray-600">₹50/hour</p>
            <p className="text-gray-600">Access to basic parking spots.</p>
          </div>
          <div className="p-6 bg-gray-100 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-blue-600 mb-4">Premium Plan</h3>
            <p className="text-gray-600">₹100/hour</p>
            <p className="text-gray-600">Priority parking and premium spots.</p>
          </div>
          <div className="p-6 bg-gray-100 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-blue-600 mb-4">Enterprise Plan</h3>
            <p className="text-gray-600">Custom Pricing</p>
            <p className="text-gray-600">For businesses and parking administrators.</p>
          </div>
        </div>
      </div>
    </div>
  );
}