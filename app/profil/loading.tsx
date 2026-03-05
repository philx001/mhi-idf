export default function ProfilLoading() {
  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="h-8 w-48 animate-pulse bg-muted rounded" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    </main>
  );
}
