export function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Profile Information</h3>
            <p className="text-gray-600">Update your account's profile information.</p>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium mb-2">Change Password</h3>
            <p className="text-gray-600">Update your password here.</p>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium mb-2">Notification Preferences</h3>
            <p className="text-gray-600">Manage how you receive notifications.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
