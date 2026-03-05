export default function JournalActiviteLoading() {
  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        </div>
        <div className="mb-6 h-5 w-96 animate-pulse rounded bg-muted" />
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 h-6 w-40 animate-pulse rounded bg-muted" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="h-8 w-24 animate-pulse rounded bg-muted" />
                <div className="h-8 flex-1 animate-pulse rounded bg-muted" />
                <div className="h-8 w-32 animate-pulse rounded bg-muted" />
                <div className="h-8 w-20 animate-pulse rounded bg-muted hidden sm:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
