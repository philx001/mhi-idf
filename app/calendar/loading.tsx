export default function CalendarLoading() {
  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 h-4 w-32 animate-pulse bg-gray-200 rounded" />
        <div className="mb-6 h-8 w-64 animate-pulse bg-gray-200 rounded" />
        <div className="mb-6 h-10 w-full animate-pulse bg-gray-200 rounded" />
        <div className="mb-4 h-4 w-40 animate-pulse bg-gray-200 rounded" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    </main>
  );
}
