import Link from "next/link";

export default function ChurchNotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-xl font-bold text-gray-900 mb-2">
        Église introuvable
      </h1>
      <p className="text-gray-600 mb-4 text-center">
        Cette église n&apos;existe pas ou n&apos;est plus accessible.
      </p>
      <Link href="/churches" className="text-blue-600 hover:underline">
        ← Retour à la liste
      </Link>
    </main>
  );
}
