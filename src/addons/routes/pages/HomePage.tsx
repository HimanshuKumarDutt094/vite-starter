import { Link } from "react-router";

export function HomePage() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        Welcome to the React Router Demo
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        This is a comprehensive example of React Router v6 features.
      </p>
      <div className="space-x-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Go to Dashboard
        </Link>
        <Link
          to="/users"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
        >
          View Users
        </Link>
      </div>
    </div>
  );
}
