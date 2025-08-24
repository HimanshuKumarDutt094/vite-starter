# React Router v7 Data APIs – Project Guide

This guide explains how this project uses React Router v7 with the Data APIs (loaders, actions, error boundaries, defer) and how to extend it.

It is tailored to the code in `src/addons/routes/`.

## Table of Contents

1. [Overview](#overview)
2. [Where the Router is wired](#where-the-router-is-wired)
3. [Route Map](#route-map)
4. [Data Loading with Loaders](#data-loading-with-loaders)
5. [Accessing Data in Components](#accessing-data-in-components)
6. [Error Boundaries](#error-boundaries)
7. [Nested Routes, Layouts, and Outlet](#nested-routes-layouts-and-outlet)
8. [Forms and Actions (how to add)](#forms-and-actions-how-to-add)
9. [Type Safety](#type-safety)
10. [v7 Future Flags in Use](#v7-future-flags-in-use)
11. [Add a New Route (step-by-step)](#add-a-new-route-step-by-step)
12. [Troubleshooting](#troubleshooting)

## Overview

The app uses the v7 router with data APIs:

- `createBrowserRouter` defines routes with `loader`, `action`, and `errorElement` per route.
- `RouterProvider` mounts the router.
- Components read data via hooks like `useLoaderData`.

Primary files:

- `src/addons/routes/router.tsx` – Route tree and v7 flags
- `src/addons/routes/index.tsx` – Exposes `AppRouter` with `RouterProvider`
- `src/addons/routes/layouts/*` – `MainLayout`, `DashboardLayout`
- `src/addons/routes/pages/*` – Route components and loaders

### Data Mode (Quick Intro)

Instead of relying on a framework plugin, this project integrates React Router's Data APIs directly ("Data Mode"): you manually create a `createBrowserRouter` with route objects that can define `loader`, `action`, `errorElement`, and more, and render it via `RouterProvider`. This aligns with the reference approach from the official docs.

## Where the Router is wired

`src/addons/routes/index.tsx`:

```tsx
import { RouterProvider } from "react-router";
import { router } from "./router";

export function AppRouter() {
  return <RouterProvider router={router} />;
}
```

Render `<AppRouter />` at your app root (e.g., in `src/main.tsx` or `src/App.tsx`).

## Route Map

Defined in `src/addons/routes/router.tsx` using `createBrowserRouter`:

```
/
├── / (HomePage)
├── /about (AboutPage)
├── /dashboard (DashboardLayout)
│   ├── / (DashboardPage)
│   ├── /profile (ProfilePage)
│   └── /settings (SettingsPage)
├── /users
│   ├── / (UsersPage)
│   └── /:userId (UserPage, loader: userLoader)
│       └── /posts
│           ├── / (PostsPage)
│           └── /:postId (PostPage, loader: postLoader, errorElement: PostErrorBoundary)
└── * (NotFoundPage)
```

The router enables v7 future flags (see [v7 Future Flags in Use](#v7-future-flags-in-use)).

## Data Loading with Loaders

Loaders run before a route renders and provide data to the route via `useLoaderData`.

Examples in this project:

- `src/addons/routes/pages/users/user.loader.ts`

```ts
import type { LoaderFunctionArgs } from "react-router";

export async function userLoader({ params }: LoaderFunctionArgs) {
  const user = {
    id: params.userId as string,
    name: "John Doe",
    email: "john@example.com",
    bio: "Frontend Developer | React Enthusiast",
  };
  return { user };
}
```

- `src/addons/routes/pages/posts/post.loader.ts`

```ts
import type { LoaderFunctionArgs } from "react-router";

export async function postLoader({ params }: LoaderFunctionArgs) {
  const post = {
    id: params.postId as string,
    title: `Post ${params.postId} Title`,
    content: "This is the content of the post... ",
    author: "John Doe",
    date: "2023-08-24",
  };
  return { post };
}
```

Wire the loaders on the matching routes in `router.tsx`:

```tsx
{
  path: 'users',
  children: [
    { index: true, element: <UsersPage /> },
    { path: ':userId', element: <UserPage />, loader: userLoader, children: [
      { path: 'posts', children: [
        { index: true, element: <PostsPage /> },
        { path: ':postId', element: <PostPage />, loader: postLoader }
      ]}
    ]}
  ]
}
```

Tips:

- Throw `Response` or `Error` from a loader to trigger an `errorElement`.
- Use `defer()` to stream large payloads progressively (optional; not used yet here).

Data source: this project uses JSONPlaceholder for demo data in `user.loader.ts`, `posts.loader.ts`, and `post.loader.ts`, forwarding `request.signal` for proper cancellation.

## Accessing Data in Components

Use `useLoaderData` in the route element to read the loader’s return value.

`src/addons/routes/pages/users/UserPage.tsx`:

```tsx
import { useLoaderData } from "react-router";
import type { LoaderData as UserLoaderData } from "./user.loader";

export function UserPage() {
  const { user } = useLoaderData() as UserLoaderData;
  // ... render with user
}
```

For params, use `useParams()`; for nested UI, render `<Outlet />` for children.

## Error Boundaries

Per-route error boundaries render when a loader/action throws or rejects.

In `router.tsx`, the post route uses `errorElement: <PostErrorBoundary />`. Implement the boundary in the page module (e.g., alongside `PostPage`).

Basic shape:

```tsx
export function PostErrorBoundary() {
  // read route error via useRouteError()
  return <div>Something went wrong loading this post.</div>;
}
```

You can also set a top-level `errorElement` (the root route here uses `NotFoundPage`).

## Nested Routes, Layouts, and Outlet

- `MainLayout` wraps the entire app and renders `<Outlet />` for child routes.
- `DashboardLayout` wraps `dashboard/*` routes.
- `UserPage` acts as a layout for its child routes (`/users/:userId/posts/*`) and includes tabs that link to its children.

Key idea: each parent renders `<Outlet />` where the matched child route will appear.

## Fetcher (Client Data without Navigation)

React Router's fetchers let you submit forms or load data without navigating. This project demonstrates a GET refresh on the posts index route using `useFetcher()` in `PostsPage` (`src/addons/routes/pages/posts/PostsPage.tsx`):

```tsx
const fetcher = useFetcher<PostsLoaderData>();
const displayed = fetcher.data?.posts ?? posts; // posts from route loader as fallback
<fetcher.Form method="get" action={`/users/${userId}/posts`}>
  <button type="submit">
    {fetcher.state === "loading" ? "Refreshing..." : "Refresh"}
  </button>
</fetcher.Form>;
```

When the form submits, the route loader (`postsLoader`) re-runs and the fetcher receives the updated data without leaving the current page context.

## Forms and Actions (how to add)

While this project currently demonstrates loaders, adding a mutation is straightforward:

1. Add an `action` to a route (e.g., `settings`):

```tsx
{ path: 'settings', element: <SettingsPage />, action: async ({ request }) => {
  const formData = await request.formData();
  // perform mutation, then return data or redirect
  return { ok: true };
} }
```

2. In the component, submit with `<Form>` or `useFetcher()`:

```tsx
import { Form, useActionData } from "react-router";

export function SettingsPage() {
  const actionData = useActionData() as { ok?: boolean } | undefined;
  return (
    <Form method="post">
      <input name="displayName" />
      <button type="submit">Save</button>
      {actionData?.ok && <p>Saved!</p>}
    </Form>
  );
}
```

Use `redirect('/somewhere')` from actions to navigate after success.

## Lazy Route Modules (Optional)

You can lazy-load route definition pieces via the `lazy` property:

```ts
createBrowserRouter([
  {
    path: "/show/:showId",
    lazy: {
      loader: async () => (await import("./show.loader")).loader,
      action: async () => (await import("./show.action")).action,
      Component: async () => (await import("./show.component")).Component,
    },
  },
]);
```

This keeps initial bundles small while still using Data APIs.

## Server Rendering Sketch (Optional)

You can server-render with `createStaticHandler` and `createStaticRouter` on the server, then hydrate in the browser with `hydrationData`:

```ts
// server.tsx
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from "react-router";
import routes from "./some-routes";

let { query, dataRoutes } = createStaticHandler(routes);

export async function handle(request: Request) {
  let context = await query(request);
  if (context instanceof Response) return context;
  let router = createStaticRouter(dataRoutes, context);
  // renderToString(<StaticRouterProvider router={router} context={context} />)
}
```

```ts
// client.tsx
import { createBrowserRouter, RouterProvider } from "react-router";
let router = createBrowserRouter(routes, {
  hydrationData: (window as any).__staticRouterHydrationData,
});
// hydrateRoot(..., <RouterProvider router={router} />)
```

## Type Safety

- Loaders use `LoaderFunctionArgs` for typed `params`, `request`.
- Export a `LoaderData` type from each loader module and cast `useLoaderData()` in the component using it.
- Co-locate types next to their route modules for clarity.

## v7 Future Flags in Use

From `router.tsx`:

```ts
future: {
  v7_relativeSplatPath: true,
  v7_startTransition: true,
  v7_fetcherPersist: true,
  v7_normalizeFormMethod: true,
  v7_partialHydration: true,
  v7_skipActionErrorRevalidation: true,
}
```

These flags opt your app into v7 behavior around transitions, fetchers, forms, hydration, and revalidation semantics.

## Add a New Route (step-by-step)

Example: add `/contact` with a loader.

1. Create `src/addons/routes/pages/ContactPage.tsx` with a component.
2. Optionally create `contact.loader.ts` exporting `contactLoader`.
3. Register the route in `router.tsx` under the root children:

```tsx
{ path: 'contact', element: <ContactPage />, loader: contactLoader }
```

4. Link to it from your nav (e.g., in `MainLayout`).

## Troubleshooting

- Ensure the route path and `useParams()` names match (e.g., `:userId`).
- If a loader/action throws, confirm an `errorElement` is present at that level or above.
- Using `<NavLink>` with `end` avoids partial matches for index routes.
- When nothing renders, check that a parent renders `<Outlet />`.

---

For deeper dives, search for these project files:

- `router.tsx` – full route tree and flags
- `pages/users/user.loader.ts` – parameterized loader example
- `pages/posts/post.loader.ts` – nested resource loader example
- `pages/users/UserPage.tsx` – `useLoaderData` and nested `<Outlet />`
