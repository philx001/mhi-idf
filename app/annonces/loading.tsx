export default function AnnoncesLoading() {
  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 h-4 w-40 animate-pulse bg-gray-200 rounded" />
        <div className="h-8 w-64 animate-pulse bg-gray-200 rounded mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 animate-pulse bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    </main>
  );
}
