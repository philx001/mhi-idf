export default function DocumentsLoading() {
  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 h-4 w-32 animate-pulse bg-muted rounded" />
        <div className="h-8 w-56 animate-pulse bg-muted rounded mb-2" />
        <div className="h-4 w-full max-w-md animate-pulse bg-muted rounded mb-6" />
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    </main>
  );
}
