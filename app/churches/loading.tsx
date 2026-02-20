export default function ChurchesLoading() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-52 animate-pulse bg-gray-200 rounded" />
          <div className="h-10 w-32 animate-pulse bg-gray-200 rounded" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 animate-pulse bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    </main>
  );
}
