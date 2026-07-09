import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type Profile = Tables<"profiles">;

export async function getSessionProfile(): Promise<{
  userId: string;
  profile: Profile;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (!profile) return null;

  return { userId: user.id, profile };
}

// (app) 레이아웃 가드: 미로그인 → /login, 승인 대기 → /pending
export async function requireActiveUser(): Promise<Profile> {
  const session = await getSessionProfile();
  if (!session) redirect("/login");
  if (session.profile.status !== "active") redirect("/pending");
  return session.profile;
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await requireActiveUser();
  if (profile.role !== "admin") redirect("/dashboard");
  return profile;
}
