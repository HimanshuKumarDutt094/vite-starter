import type { LoaderFunctionArgs } from "react-router";

export type PostSummary = {
  id: number;
  userId: number;
  title: string;
};

export type LoaderData = {
  posts: PostSummary[];
};

export async function postsLoader({
  params,
  request,
}: LoaderFunctionArgs): Promise<LoaderData> {
  const userId = params.userId as string;
  const res = await fetch(
    `https://jsonplaceholder.typicode.com/users/${userId}/posts`,
    {
      signal: request.signal,
    }
  );
  if (!res.ok) {
    throw new Response("Failed to load posts", { status: res.status });
  }
  const posts = (await res.json()) as PostSummary[];
  return { posts };
}
