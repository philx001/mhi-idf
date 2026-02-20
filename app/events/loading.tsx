export default function EventsLoading() {
  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-xl mx-auto">
        <div className="mb-6 h-4 w-32 animate-pulse bg-gray-200 rounded" />
        <div className="h-8 w-48 animate-pulse bg-gray-200 rounded mb-6" />
        <div className="space-y-4">
          <div className="h-12 animate-pulse bg-gray-200 rounded" />
          <div className="h-12 animate-pulse bg-gray-200 rounded" />
          <div className="h-24 animate-pulse bg-gray-200 rounded" />
        </div>
      </div>
    </main>
  );
}
