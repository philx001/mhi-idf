/**
 * Couleur déterministe par église pour le calendrier partagé.
 * Chaque church_id reçoit toujours la même couleur (styles inline pour éviter la purge Tailwind).
 */

/** Palette [fond, texte] en hex - distinctes et lisibles */
const CHURCH_COLOR_PALETTE: [string, string][] = [
  ["#dbeafe", "#1e3a8a"], // blue
  ["#fef3c7", "#92400e"], // amber
  ["#d1fae5", "#065f46"], // emerald
  ["#ffe4e6", "#9f1239"], // rose
  ["#ede9fe", "#5b21b6"], // violet
  ["#e0f2fe", "#0369a1"], // sky
  ["#ffedd5", "#9a3412"], // orange
  ["#ccfbf1", "#0f766e"], // teal
  ["#fae8ff", "#86198f"], // fuchsia
  ["#ecfccb", "#365314"], // lime
  ["#e0e7ff", "#3730a3"], // indigo
  ["#cffafe", "#155e75"], // cyan
  ["#fce7f3", "#9d174d"], // pink
  ["#e7e5e4", "#44403c"], // stone
  ["#e2e8f0", "#334155"], // slate
];

/** Hash simple et déterministe d'une chaîne vers un entier positif */
function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h = (h << 5) - h + c;
    h |= 0;
  }
  return Math.abs(h);
}

/**
 * Retourne les styles inline pour la couleur d'une église (à utiliser dans style={}).
 * Le même church_id renvoie toujours les mêmes couleurs.
 */
export function getChurchColorStyle(churchId: string): { backgroundColor: string; color: string } {
  const index = hashString(churchId) % CHURCH_COLOR_PALETTE.length;
  const [bg, text] = CHURCH_COLOR_PALETTE[index];
  return { backgroundColor: bg, color: text };
}

