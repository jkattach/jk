"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import type { Database } from "@/types/database";

type Role = Database["public"]["Enums"]["user_role"];
type Status = Database["public"]["Enums"]["user_status"];

const ROLES: Role[] = ["admin", "seller", "installer"];
const STATUSES: Status[] = ["pending", "active", "suspended"];

export async function updateUser(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "") as Role;
  const status = String(formData.get("status") ?? "") as Status;

  if (!userId || !ROLES.includes(role) || !STATUSES.includes(status)) {
    throw new Error("잘못된 요청입니다.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role, status })
    .eq("id", userId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
}
