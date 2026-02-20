export default function GestionUtilisateursLoading() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 h-8 w-64 animate-pulse bg-gray-200 rounded" />
        <div className="h-12 w-full animate-pulse bg-gray-200 rounded mb-4" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-14 animate-pulse bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    </main>
  );
}
