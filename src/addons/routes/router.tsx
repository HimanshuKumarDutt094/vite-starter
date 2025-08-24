import { createBrowserRouter } from "react-router";
import { MainLayout } from "./layouts/MainLayout";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { HomePage } from "./pages/HomePage";
import { AboutPage } from "./pages/AboutPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { ProfilePage } from "./pages/dashboard/ProfilePage";
import { SettingsPage } from "./pages/dashboard/SettingsPage";
import { UserPage } from "./pages/users/UserPage";
import { userLoader } from "./pages/users/user.loader";
import { UsersPage } from "./pages/users/UsersPage";
import { PostsPage } from "./pages/posts/PostsPage";
import { PostPage, PostErrorBoundary } from "./pages/posts/PostPage";
import { postLoader } from "./pages/posts/post.loader";
import { postsLoader } from "./pages/posts/posts.loader";
import { NotFoundPage } from "./pages/NotFoundPage";

/**
 * Application router configuration
 *
 * This configuration defines all the routes for the application using React Router v7.
 * The router is configured with v7 future flags enabled for the latest features.
 */
export const router = createBrowserRouter(
  [
    {
      // Root route that wraps the entire application
      path: "/",
      element: <MainLayout />,
      errorElement: <NotFoundPage />,
      children: [
        { index: true, element: <HomePage /> },
        { path: "about", element: <AboutPage /> },
        {
          // All dashboard routes are nested under /dashboard
          path: "dashboard",
          element: <DashboardLayout />,
          children: [
            { index: true, element: <DashboardPage /> },
            { path: "profile", element: <ProfilePage /> },
            { path: "settings", element: <SettingsPage /> },
          ],
        },
        {
          // User routes under /users
          path: "users",
          children: [
            { index: true, element: <UsersPage /> },
            {
              // Individual user at /users/:userId
              path: ":userId",
              element: <UserPage />,
              // Loader fetches user data
              loader: userLoader,
              children: [
                {
                  // User's posts at /users/:userId/posts
                  path: "posts",
                  children: [
                    {
                      index: true,
                      element: <PostsPage />,
                      loader: postsLoader,
                    },
                    {
                      // Individual post at /users/:userId/posts/:postId
                      path: ":postId",
                      element: <PostPage />,
                      errorElement: <PostErrorBoundary />,
                      // Loader fetches specific post data
                      loader: postLoader,
                    },
                  ],
                },
              ],
            },
          ],
        },
        // Catch-all route for 404s
        { path: "*", element: <NotFoundPage /> },
      ],
    },
  ],
  {
    // Enable v7 future flags
    future: {
      v7_relativeSplatPath: true,
      v7_startTransition: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  }
);
