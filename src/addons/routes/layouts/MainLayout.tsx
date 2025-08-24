import { Link, Outlet } from "react-router";

/**
 * MainLayout Component
 *
 * This is the root layout component that wraps the entire application.
 * It provides the main navigation and renders child routes in the Outlet.
 *
 * The Outlet component is where child route elements will be rendered.
 * For example:
 * - When the path is '/', the HomePage component is rendered in the Outlet
 * - When the path is '/about', the AboutPage component is rendered in the Outlet
 * - When the path is '/users', the UsersPage is rendered in the Outlet
 * - When the path is '/dashboard/*', the DashboardLayout is rendered in the Outlet
 *
 * The navigation menu is always visible, while the content below changes based on the route.
 */

/**
 * Renders the main application layout with navigation and content area.
 * The Outlet component is a placeholder that renders the matched child route's element.
 *
 * Navigation Structure:
 * - Home: Root path ('/')
 * - About: Static route ('/about')
 * - Dashboard: Nested routes under '/dashboard/*'
 * - Users: User-related routes under '/users/*'
 */
export function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <Link
                to="/"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                About
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Dashboard
              </Link>
              <Link
                to="/users"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Users
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 
        Main Content Area
        - The Outlet component renders the matched child route's element
        - The styling provides consistent padding and max-width for content
        - Child routes will be rendered in place of the Outlet
       */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
