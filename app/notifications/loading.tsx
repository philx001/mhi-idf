export default function NotificationsLoading() {
  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="h-8 w-40 animate-pulse bg-muted rounded mb-6" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 animate-pulse bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    </main>
  );
}
