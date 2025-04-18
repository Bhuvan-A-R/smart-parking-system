export default function AuthLayout({ children, title, notification }) {
  return (
    <div className="mt-10 flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-500 to-blue-100 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-2xl rounded-2xl p-8 sm:p-10 w-full max-w-sm sm:max-w-md lg:max-w-lg">
        {notification && (
          <div
            className={`p-4 mb-4 text-sm rounded ${
              notification.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {notification.message}
          </div>
        )}
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-black mb-6">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
