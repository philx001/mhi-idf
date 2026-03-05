/**
 * Configuration pour l'affichage de l'admin aux non-admins.
 * L'admin (philippe.diarra@gmail.com) est affiché comme "Responsable église - Eglise de Croissy"
 * pour les membres et responsables d'églises, tout en conservant ses droits admin.
 */

export const ADMIN_DISPLAY_AS_RESPONSABLE = {
  /** Email de l'admin à masquer (affiché comme responsable Croissy aux non-admins). */
  email: "philippe.diarra@gmail.com",
  /** Libellé d'affichage pour les non-admins. */
  displayLabel: "Responsable église",
  /** Nom de l'église affiché. */
  displayChurchName: "Eglise de Croissy",
};

export function isAdminDisplayAsResponsable(email: string | undefined): boolean {
  return email?.toLowerCase() === ADMIN_DISPLAY_AS_RESPONSABLE.email.toLowerCase();
}
