export default function Home() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Today</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Here is what you need to focus on today.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder for Task Cards */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold">Design Homepage</h3>
          <p className="text-sm text-gray-500 mt-1">Due Today</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">High</span>
            <span className="text-xs text-gray-400">#MVP</span>
          </div>
        </div>
      </div>
    </div>
  );
}
