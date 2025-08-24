import { Link, useParams, useLoaderData, useFetcher } from "react-router";
import type { LoaderData as PostsLoaderData } from "./posts.loader";
import { Button } from "@/components/ui/button";

/**
 * PostsPage component displays a list of posts for a user
 * Uses a route loader (posts.loader.ts) and demonstrates useFetcher() to refresh.
 *
 * @route /users/:userId/posts
 */
export function PostsPage() {
  const { userId } = useParams<{ userId: string }>();
  const { posts } = useLoaderData() as PostsLoaderData;
  const fetcher = useFetcher<PostsLoaderData>();

  const displayed = fetcher.data?.posts ?? posts;
  const loading = fetcher.state === "loading" || fetcher.state === "submitting";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">User Posts</h2>
        <fetcher.Form method="get" action=".">
          {/** When refreshing an index route via fetcher, include ?index to target the index loader */}
          <input type="hidden" name="index" value="" />
          <Button
            type="submit"
            className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </fetcher.Form>
      </div>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {displayed.map((post) => (
            <li key={post.id}>
              <Link
                to={`/users/${userId}/posts/${post.id}`}
                className="block hover:bg-gray-50 px-4 py-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-blue-600">
                    {post.title}
                  </p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Read
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
