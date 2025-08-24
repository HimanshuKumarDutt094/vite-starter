import {
  useLoaderData,
  useNavigate,
  useParams,
  isRouteErrorResponse,
  useRouteError,
} from "react-router";
import type { LoaderData as PostLoaderData } from "./post.loader";

/**
 * PostPage component displays detailed information about a blog post
 *
 * @route /users/:userId/posts/:postId
 * @param userId - The ID of the user who owns the post (from route params)
 * @param postId - The ID of the post to display (from route params)
 * @uses useLoaderData - To access data loaded by postLoader
 * @uses useParams - To access route parameters
 * @uses useNavigate - To navigate between routes
 */

// Error boundary component for post loading errors
export function PostErrorBoundary() {
  const error = useRouteError();
  const { postId } = useParams();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <h2 className="text-lg font-medium text-red-800">
          Error loading post {postId}
        </h2>
        <p className="mt-1 text-red-700">
          {error.status} {error.statusText}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-red-50 p-4 rounded-md">
      <h2 className="text-lg font-medium text-red-800">Unexpected error</h2>
      <p className="mt-1 text-red-700">
        Something went wrong loading this post.
      </p>
    </div>
  );
}

export function PostPage() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { post } = useLoaderData() as PostLoaderData;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
        <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
          <div className="mt-2 flex items-center text-sm text-gray-500">
            By {post.author}
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString()}
            </time>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <div className="py-4 sm:py-5 sm:px-6">
          <p className="text-gray-700 whitespace-pre-line">{post.content}</p>
        </div>
      </div>
      <div className="px-4 py-4 sm:px-6 border-t border-gray-200 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)} // Better: Use browser's history stack
          className="text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none flex items-center gap-1"
        >
          <span aria-hidden="true">&larr;</span> Back
        </button>
        <button
          onClick={() => navigate(`/users/${userId}/posts`)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none"
        >
          View all posts
        </button>
      </div>
    </div>
  );
}
