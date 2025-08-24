import type { LoaderFunctionArgs } from "react-router";

/**
 * User data type definition (based on JSONPlaceholder shape)
 */
type UserData = {
  id: number;
  name: string;
  username: string;
  email: string;
  phone?: string;
  website?: string;
  /** Optional bio for UI display; JSONPlaceholder doesn't provide this */
  bio?: string;
};

type PostSummary = {
  id: number;
  userId: number;
  title: string;
};

export type LoaderData = {
  user: UserData;
  posts: PostSummary[];
};

/**
 * Loader function for the UserPage
 * - Fetches the user data and that user's posts via JSONPlaceholder
 * - Passes through the request.abort signal for proper cancellation
 *
 * @route /users/:userId
 */
export async function userLoader({
  params,
  request,
}: LoaderFunctionArgs): Promise<LoaderData> {
  const userId = params.userId as string;

  const controllerSignal = request.signal;

  const [userRes, postsRes] = await Promise.all([
    fetch(`https://jsonplaceholder.typicode.com/users/${userId}`, {
      signal: controllerSignal,
    }),
    fetch(`https://jsonplaceholder.typicode.com/users/${userId}/posts`, {
      signal: controllerSignal,
    }),
  ]);

  if (!userRes.ok) {
    throw new Response("Failed to load user", { status: userRes.status });
  }
  if (!postsRes.ok) {
    throw new Response("Failed to load user posts", {
      status: postsRes.status,
    });
  }

  const userJson = (await userRes.json()) as Omit<UserData, "bio">;
  const user: UserData = {
    ...userJson,
    // Provide a friendly fallback for the UI; source doesn't include bio
    bio: undefined,
  };
  const posts = (await postsRes.json()) as PostSummary[];

  return { user, posts };
}

