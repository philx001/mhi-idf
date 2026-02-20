export default function DashboardLoading() {
  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-48 animate-pulse bg-gray-200 rounded" />
          <div className="flex gap-4">
            <div className="h-8 w-24 animate-pulse bg-gray-200 rounded" />
            <div className="h-8 w-24 animate-pulse bg-gray-200 rounded" />
          </div>
        </div>
        <div className="mb-8">
          <div className="h-6 w-56 animate-pulse bg-gray-200 rounded mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="mb-8">
          <div className="h-6 w-40 animate-pulse bg-gray-200 rounded mb-4" />
          <div className="h-16 animate-pulse bg-gray-200 rounded-lg" />
        </div>
        <div className="flex flex-wrap gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 w-36 animate-pulse bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    </main>
  );
}
