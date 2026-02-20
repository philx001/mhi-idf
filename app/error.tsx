"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <h1 className="text-xl font-semibold text-red-700 mb-2">Une erreur est survenue</h1>
      <pre className="text-sm text-left bg-white p-4 rounded border border-red-200 overflow-auto max-w-2xl mb-4">
        {error.message}
      </pre>
      <button
        type="button"
        onClick={reset}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Réessayer
      </button>
    </div>
  );
}
