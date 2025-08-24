import { useNavigate } from "react-router";

export function ProfilePage() {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">John Doe</h3>
            <p className="text-gray-600">john.doe@example.com</p>
          </div>
          <button
            onClick={() => navigate("/dashboard/settings")}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
