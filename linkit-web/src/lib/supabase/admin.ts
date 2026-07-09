import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// service role 클라이언트 — RLS를 우회하므로 반드시 서버에서만 사용.
// 용도: 견적서 공개 링크(/q/[token]) 열람·확정 등 비로그인 접근 처리.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
