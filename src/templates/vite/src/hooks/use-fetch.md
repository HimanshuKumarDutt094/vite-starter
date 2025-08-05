# `useFetch` Hook Documentation

The `useFetch` hook provides a flexible and type-safe way to handle data fetching in React applications. It manages loading states, data, and errors, and supports various HTTP methods and custom options.

## Installation

This hook is typically part of a React project setup and doesn't require separate installation if already included in your project's `src/hooks` directory.

## Usage

Import the `useFetch` hook into your component:

```typescript
import { useFetch } from "./use-fetch";
```

### Basic GET Request

To perform a simple GET request, provide the URL as the first argument:

```typescript
import React from "react";
import { useFetch } from "./use-fetch";

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

function MyComponent() {
  const { data, status, error, refetch } = useFetch<Post[]>(
    "https://jsonplaceholder.typicode.com/posts"
  );

  if (status === "loading") {
    return <div>Loading posts...</div>;
  }

  if (status === "error") {
    return <div>Error: {error?.message}</div>;
  }

  return (
    <div>
      <h1>Posts</h1>
      <button onClick={refetch}>Refetch Posts</button>
      <ul>
        {data?.map((post) => (
          <li key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Handling Different HTTP Methods (POST, PUT, DELETE, etc.)

You can specify the HTTP method and provide a request body using the `fetchOptions` parameter.

#### POST Request Example

```typescript
import React, { useState } from "react";
import { useFetch } from "./use-fetch";

interface NewPost {
  title: string;
  body: string;
  userId: number;
}

interface CreatedPost extends NewPost {
  id: number;
}

function CreatePostComponent() {
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");

  const {
    data: createdPost,
    status,
    error,
    refetch, // refetch here would re-execute the POST request
  } = useFetch<CreatedPost>("https://jsonplaceholder.typicode.com/posts", {
    fetchOptions: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: postTitle,
        body: postBody,
        userId: 1,
      }),
    },
  });

  const handleSubmit = () => {
    // To trigger the fetch, you would typically call refetch or re-render the component
    // with updated URL/options if the URL is dynamic.
    // For a one-off POST, you might use a direct fetch call or a separate state to control `refetch`.
    // For demonstration, let's assume `refetch` is called after setting state.
    // In a real app, you might have a separate function that calls `fetch` directly or
    // conditionally renders `useFetch` based on a trigger.
    refetch(); // This will re-run the POST request with current state
  };

  return (
    <div>
      <h2>Create New Post</h2>
      <input
        type="text"
        placeholder="Title"
        value={postTitle}
        onChange={(e) => setPostTitle(e.target.value)}
      />
      <textarea
        placeholder="Body"
        value={postBody}
        onChange={(e) => setPostBody(e.target.value)}
      />
      <button onClick={handleSubmit} disabled={status === "loading"}>
        {status === "loading" ? "Creating..." : "Create Post"}
      </button>

      {status === "success" && createdPost && (
        <p>Post created successfully with ID: {createdPost.id}</p>
      )}
      {status === "error" && <p>Error creating post: {error?.message}</p>}
    </div>
  );
}
```

### Custom Headers

You can add custom headers to your requests via `fetchOptions`:

```typescript
import React from "react";
import { useFetch } from "./use-fetch";

interface UserProfile {
  name: string;
  email: string;
}

function UserProfileComponent() {
  const { data, status, error } = useFetch<UserProfile>(
    "https://api.example.com/profile",
    {
      fetchOptions: {
        headers: {
          Authorization: "Bearer your_token_here",
          "X-Custom-Header": "MyValue",
        },
      },
    }
  );

  if (status === "loading") return <div>Loading profile...</div>;
  if (status === "error") return <div>Error: {error?.message}</div>;

  return (
    <div>
      <h1>User Profile</h1>
      <p>Name: {data?.name}</p>
      <p>Email: {data?.email}</p>
    </div>
  );
}
```

### Data Transformation with `create` Option

The `create` option allows you to transform the raw fetched data into a specific type or structure before it's set in the `data` state. This is useful for validating or mapping API responses.

```typescript
import React from "react";
import { useFetch } from "./use-fetch";

interface RawProduct {
  id: number;
  name: string;
  price_cents: number;
}

interface Product {
  id: number;
  name: string;
  price: string; // Formatted price
}

function ProductListComponent() {
  const { data, status, error } = useFetch<Product[]>(
    "https://api.example.com/products",
    {
      create: (rawData: unknown) => {
        if (!Array.isArray(rawData)) {
          throw new Error("Expected an array of products");
        }
        return rawData.map((item: RawProduct) => ({
          id: item.id,
          name: item.name,
          price: `$${(item.price_cents / 100).toFixed(2)}`,
        }));
      },
    }
  );

  if (status === "loading") return <div>Loading products...</div>;
  if (status === "error") return <div>Error: {error?.message}</div>;

  return (
    <div>
      <h1>Products</h1>
      <ul>
        {data?.map((product) => (
          <li key={product.id}>
            {product.name} - {product.price}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Conditional Fetching

The `useFetch` hook automatically fetches data when the `url` changes. If you want to conditionally fetch data (e.g., only after a user action), you can control the `url` state or use the `refetch` function.

```typescript
import React, { useState } from "react";
import { useFetch } from "./use-fetch";

interface User {
  id: number;
  name: string;
}

function UserDetailsComponent() {
  const [userId, setUserId] = useState<number | null>(null);
  const url = userId
    ? `https://jsonplaceholder.typicode.com/users/${userId}`
    : "";

  const { data, status, error } = useFetch<User>(url);

  const handleFetchUser = (id: number) => {
    setUserId(id);
  };

  return (
    <div>
      <h2>User Details</h2>
      <button onClick={() => handleFetchUser(1)}>Fetch User 1</button>
      <button onClick={() => handleFetchUser(2)}>Fetch User 2</button>
      <button onClick={() => setUserId(null)}>Clear User</button>

      {status === "loading" && <p>Loading user...</p>}
      {status === "error" && <p>Error: {error?.message}</p>}
      {status === "success" && data && (
        <div>
          <p>ID: {data.id}</p>
          <p>Name: {data.name}</p>
        </div>
      )}
      {status === "idle" && !userId && <p>Select a user to fetch.</p>}
    </div>
  );
}
```

### Error Handling

The `error` state will contain a `FetchError` object if the request fails (e.g., network error, non-2xx HTTP status).

```typescript
import React from "react";
import { useFetch } from "./use-fetch";

function ErrorHandlingComponent() {
  // This URL will intentionally cause a 404 error
  const { data, status, error } = useFetch(
    "https://jsonplaceholder.typicode.com/non-existent-endpoint"
  );

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "error") {
    return (
      <div style={{ color: "red" }}>
        <h2>Fetch Error!</h2>
        <p>Code: {error?.code}</p>
        <p>Message: {error?.message}</p>
        <p>Please check the URL or your network connection.</p>
      </div>
    );
  }

  return (
    <div>Data loaded successfully (though not expected for this example).</div>
  );
}
```

## API Reference

### `useFetch<T>(url: string, options?: UseFetchOptions<T>)`

#### Parameters

- `url`: `string`
  The URL to fetch data from. The fetch request will be triggered automatically when this URL changes.
- `options`: `UseFetchOptions<T>` (optional)
  An object containing additional options for the fetch request.
  - `create?`: `(data: unknown) => T`
    An optional function to transform the raw JSON response data into the desired type `T`. If not provided, the raw data is cast directly to `T`.
  - `fetchOptions?`: `TypeSafeFetchOptions`
    Standard `RequestInit` options for the underlying `fetch` API, with a type-safe `method` property.
    - `method?`: `"GET" | "POST" | "PUT" | "PATCH" | "DELETE"` (default: `"GET"`)
    - `headers?`: `Record<string, string>`
    - `body?`: `BodyInit | null`
    - Other standard `RequestInit` properties (e.g., `mode`, `cache`, `credentials`, `referrer`, `referrerPolicy`, `integrity`, `keepalive`, `signal`).

#### Returns

An object with the following properties:

- `status`: `FetchStatus`
  The current status of the fetch request. Possible values: `"idle"`, `"loading"`, `"success"`, `"error"`.
- `data`: `T | null`
  The fetched data, typed as `T`, or `null` if no data has been fetched yet or an error occurred.
- `error`: `FetchError | null`
  An object containing error details (`code` and `message`) if the request failed, or `null` otherwise.
- `refetch`: `() => void`
  A function that can be called to manually re-trigger the fetch request.

### `TypeSafeFetchOptions`

Extends `RequestInit` with a type-safe `method` property.

```typescript
export interface TypeSafeFetchOptions extends Omit<RequestInit, "method"> {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: BodyInit | null;
}
```

### `FetchStatus`

A union type representing the possible states of the fetch operation.

```typescript
export type FetchStatus = "idle" | "loading" | "success" | "error";
```

### `FetchError`

An interface describing the structure of an error object returned by the hook.

```typescript
export interface FetchError {
  code: string;
  message: string;
}
```
