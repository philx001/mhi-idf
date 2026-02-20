"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserAndRole } from "@/lib/supabase/queries";
import type { Notification, NotificationImportance } from "@/types/database";

/** Récupère les emails des responsables d'églises (pour envoi notification urgente). */
async function getChurchResponsablesEmails(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const admin = createAdminClient();
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "responsable_eglise");
    if (!roles?.length) return [];

    const userIds = [...new Set(roles.map((r) => r.user_id))];
    const { data: usersData } = await admin.auth.admin.listUsers({ perPage: 500 });
    const users = usersData?.users ?? [];
    const emails: string[] = [];
    for (const uid of userIds) {
      const u = users.find((x) => x.id === uid);
      if (u?.email) emails.push(u.email);
    }
    return emails;
  } catch {
    return [];
  }
}

/** Envoie un email aux responsables d'églises pour une notification urgente. */
async function sendUrgentNotificationToResponsables(
  title: string,
  content: string | null
): Promise<void> {
  const emails = await getChurchResponsablesEmails();
  if (emails.length === 0) return;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
    await fetch(`${baseUrl}/api/notifications/urgent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: emails,
        subject: `[Urgent] ${title}`,
        text: content ?? title,
      }),
    });
  } catch (err) {
    console.error("[notifications] sendUrgentNotificationToResponsables:", err);
  }
}

export async function createNotification(input: {
  title: string;
  content?: string;
  importance: NotificationImportance;
}): Promise<{ error?: string }> {
  const supabase = await createClient();
  const auth = await getUserAndRole(supabase);
  if (!auth) return { error: "Non authentifié" };

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      title: input.title.trim(),
      content: input.content?.trim() ?? null,
      importance: input.importance,
      created_by: auth.user.id,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  if (input.importance === "urgente") {
    await sendUrgentNotificationToResponsables(input.title.trim(), input.content?.trim() ?? null);
  }

  revalidatePath("/dashboard");
  revalidatePath("/notifications");
  return {};
}

export async function updateNotification(
  id: string,
  input: { title?: string; content?: string; importance?: NotificationImportance }
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const auth = await getUserAndRole(supabase);
  if (!auth) return { error: "Non authentifié" };

  const { data: notif, error: fetchErr } = await supabase
    .from("notifications")
    .select("created_by")
    .eq("id", id)
    .single();

  if (fetchErr || !notif) return { error: "Notification introuvable." };
  const isSiege = auth.roleInfo.isSiege;
  if (notif.created_by !== auth.user.id && !isSiege) {
    return { error: "Seul l'auteur ou le responsable siège peut modifier cette notification." };
  }

  const { error } = await supabase
    .from("notifications")
    .update({
      ...(input.title !== undefined && { title: input.title.trim() }),
      ...(input.content !== undefined && { content: input.content?.trim() ?? null }),
      ...(input.importance !== undefined && { importance: input.importance }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/notifications");
  return {};
}

export async function deleteNotification(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const auth = await getUserAndRole(supabase);
  if (!auth) return { error: "Non authentifié" };

  const { data: notif, error: fetchErr } = await supabase
    .from("notifications")
    .select("created_by")
    .eq("id", id)
    .single();

  if (fetchErr || !notif) return { error: "Notification introuvable." };
  const isSiege = auth.roleInfo.isSiege;
  if (notif.created_by !== auth.user.id && !isSiege) {
    return { error: "Seul l'auteur ou le responsable siège peut supprimer cette notification." };
  }

  const { error } = await supabase.from("notifications").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/notifications");
  return {};
}
