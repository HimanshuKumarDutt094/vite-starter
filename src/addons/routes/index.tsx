import { RouterProvider } from "react-router";
import { router } from "./router";
import type { JSX } from "react";

/**
 * AppRouter Component
 *
 * Provides the router context to the application using React Router v7.
 * This component should be rendered at the root of your application.
 *
 * @returns {JSX.Element} The router provider with the application routes
 */
export function AppRouter(): JSX.Element {
  return <RouterProvider router={router} />;
}
