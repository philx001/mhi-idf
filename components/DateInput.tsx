"use client";

/**
 * Champ date : sélection uniquement via le sélecteur de date (pas de saisie manuelle).
 * Évite les erreurs de format (ex: 04/04/202222).
 */
export function DateInput(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  const { className, ...rest } = props;
  return (
    <input
      type="date"
      {...rest}
      onKeyDown={(e) => {
        if (e.key !== "Tab" && e.key !== "Escape") {
          e.preventDefault();
        }
      }}
      onPaste={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      className={
        className ??
        "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer"
      }
    />
  );
}
