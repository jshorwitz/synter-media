export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          🎉 Settings Panel is Live!
        </h1>
        <p className="text-gray-600 mb-6">
          Your Synter settings panel has been successfully deployed and is running locally.
        </p>
        <div className="space-y-3">
          <a 
            href="/settings"
            className="block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Open Settings Panel
          </a>
          <a 
            href="/settings/billing"
            className="block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Test Billing Features
          </a>
          <a 
            href="/settings/team"
            className="block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Test Team Management
          </a>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Running on <code className="bg-gray-100 px-2 py-1 rounded">localhost:3001</code>
          </p>
        </div>
      </div>
    </div>
  );
}
