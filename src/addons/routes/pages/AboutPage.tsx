export function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">About This Demo</h1>
      <div className="prose">
        <p className="text-gray-600 mb-4">
          This application demonstrates various React Router v6 features including:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>Basic routing</li>
          <li>Nested routes</li>
          <li>Route parameters</li>
          <li>Nested layouts</li>
          <li>Loader functions</li>
          <li>404 handling</li>
        </ul>
      </div>
    </div>
  );
}
