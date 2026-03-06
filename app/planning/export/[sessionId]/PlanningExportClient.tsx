"use client";

import { FileDown } from "lucide-react";

export function PlanningExportClient() {
  function handleExportPdf() {
    window.print();
  }

  return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg print:hidden">
      <p className="text-sm text-blue-900 mb-3">
        Utilisez le bouton ci-dessous pour ouvrir la boîte de dialogue d&apos;impression, puis choisissez
        &quot;Enregistrer au format PDF&quot; ou &quot;Microsoft Print to PDF&quot; pour télécharger ce programme en PDF.
      </p>
      <button
        type="button"
        onClick={handleExportPdf}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
      >
        <FileDown className="h-4 w-4" />
        Exporter en PDF
      </button>
    </div>
  );
}
