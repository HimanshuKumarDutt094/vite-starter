import { Link } from "react-router";

export function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Quick Links
          </h3>
          <ul className="space-y-2">
            <li>
              <Link
                to="/dashboard/profile"
                className="text-blue-600 hover:underline"
              >
                View Profile
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/settings"
                className="text-blue-600 hover:underline"
              >
                Account Settings
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
