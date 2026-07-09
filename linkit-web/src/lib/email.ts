import "server-only";
import { Resend } from "resend";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type NotifyParams = {
  supabase: SupabaseClient<Database>;
  type: string;
  to: { email: string; profileId?: string | null };
  subject: string;
  html: string;
  quoteId?: string | null;
  orderId?: string | null;
  requestId?: string | null;
  payload?: Record<string, unknown>;
};

const FROM = process.env.EMAIL_FROM ?? "수산 회전링크 <onboarding@resend.dev>";

// 이메일 발송 + notifications 로깅. RESEND_API_KEY 미설정 시 발송은 건너뛰고 queued로 기록.
export async function sendNotificationEmail({
  supabase,
  type,
  to,
  subject,
  html,
  quoteId,
  orderId,
  requestId,
  payload,
}: NotifyParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  let status: Database["public"]["Enums"]["notification_status"] = "queued";
  let error: string | null = null;

  if (apiKey) {
    try {
      const resend = new Resend(apiKey);
      const { error: sendError } = await resend.emails.send({
        from: FROM,
        to: to.email,
        subject,
        html,
      });
      if (sendError) {
        status = "failed";
        error = sendError.message;
      } else {
        status = "sent";
      }
    } catch (e) {
      status = "failed";
      error = e instanceof Error ? e.message : String(e);
    }
  } else {
    error = "RESEND_API_KEY 미설정 — 발송 건너뜀";
    console.warn(`[email] ${type} → ${to.email} (${subject}) : ${error}`);
  }

  // 발송 실패해도 기록은 남긴다 (로깅 실패는 무시)
  await supabase.rpc("log_notification", {
    p_type: type,
    p_email: to.email,
    p_profile: to.profileId ?? undefined,
    p_quote: quoteId ?? undefined,
    p_order: orderId ?? undefined,
    p_request: requestId ?? undefined,
    p_payload: (payload ?? {}) as never,
    p_status: status,
    p_error: error ?? undefined,
  });
}

export function emailLayout(title: string, bodyHtml: string): string {
  return `
  <div style="font-family:'Apple SD Gothic Neo',Pretendard,Malgun Gothic,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1a1a1a">
    <h2 style="margin:0 0 4px">수산 회전링크</h2>
    <h3 style="margin:0 0 16px;font-weight:600">${title}</h3>
    <div style="border:1px solid #e5e5e5;border-radius:8px;padding:20px;line-height:1.7">
      ${bodyHtml}
    </div>
    <p style="color:#888;font-size:12px;margin-top:16px">본 메일은 수산 회전링크 판매 관리 시스템에서 자동 발송되었습니다.</p>
  </div>`;
}
