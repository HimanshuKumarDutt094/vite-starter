import type { LoaderFunctionArgs } from "react-router";

type PostData = {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
};

export type LoaderData = {
  post: PostData;
};

/**
 * Loader function for the PostPage
 * - Fetches a post and the author name from JSONPlaceholder
 *
 * @route /users/:userId/posts/:postId
 */
export async function postLoader({
  params,
  request,
}: LoaderFunctionArgs): Promise<LoaderData> {
  const postId = params.postId as string;

  const postRes = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${postId}`,
    {
      signal: request.signal,
    }
  );
  if (!postRes.ok) {
    throw new Response("Failed to load post", { status: postRes.status });
  }
  const postJson = (await postRes.json()) as {
    id: number;
    userId: number;
    title: string;
    body: string;
  };

  const userRes = await fetch(
    `https://jsonplaceholder.typicode.com/users/${postJson.userId}`,
    {
      signal: request.signal,
    }
  );
  if (!userRes.ok) {
    throw new Response("Failed to load author", { status: userRes.status });
  }
  const userJson = (await userRes.json()) as { name: string };

  const post: PostData = {
    id: postJson.id,
    title: postJson.title,
    content: postJson.body,
    author: userJson.name,
    date: new Date().toISOString(),
  };

  return { post };
}
