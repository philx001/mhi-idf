import { NextResponse } from "next/server";

/**
 * Envoi d'email aux responsables d'églises pour une notification urgente.
 * Body: { to: string[], subject: string, text: string }
 *
 * Pour activer l'envoi réel : installer Resend (npm install resend),
 * ajouter RESEND_API_KEY dans .env.local, et décommenter le code ci-dessous.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject, text } = body as { to?: string[]; subject?: string; text?: string };

    if (!Array.isArray(to) || to.length === 0 || !subject) {
      return NextResponse.json(
        { error: "to (array) et subject requis" },
        { status: 400 }
      );
    }

    // Option 1 : Envoi via Resend (décommenter après npm install resend et RESEND_API_KEY)
    // const Resend = (await import("resend")).Resend;
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // const { error } = await resend.emails.send({
    //   from: process.env.RESEND_FROM ?? "notifications@votredomaine.com",
    //   to,
    //   subject,
    //   text: text ?? subject,
    // });
    // if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Pour l'instant : log pour debug (remplacer par l'envoi Resend ci-dessus en production)
    console.log("[notifications/urgent] Would send email:", { to: to.length, subject, text: text?.slice(0, 80) });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[notifications/urgent]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}
