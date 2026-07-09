"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireActiveUser } from "@/lib/auth";
import { sendNotificationEmail, emailLayout } from "@/lib/email";
import { formatDate } from "@/lib/format";
import type { Database } from "@/types/database";

type OrderStatus = Database["public"]["Enums"]["order_status"];

type Contact = { id: string; name: string; email: string | null; phone?: string | null };
type NotifyContext = {
  order_no: string;
  status: OrderStatus;
  ship_date: string | null;
  install_date: string | null;
  install_location: string | null;
  quote_no: string;
  total: number;
  customer_name: string | null;
  customer_phone: string | null;
  seller: Contact | null;
  installer: Contact | null;
  admins: Contact[];
};

// 전이별 이메일: 수신자 선정 + 본문
function buildEmails(next: OrderStatus, ctx: NotifyContext, orderUrl: string) {
  const emails: { to: Contact; subject: string; body: string }[] = [];
  const push = (to: Contact | null, subject: string, body: string) => {
    if (to?.email) emails.push({ to, subject, body });
  };
  const base = `<p>주문번호: <strong>${ctx.order_no}</strong> (견적 ${ctx.quote_no})</p>
    <p>고객: ${ctx.customer_name ?? "—"}</p>`;
  const link = `<p><a href="${orderUrl}">주문 상세 보기</a></p>`;

  switch (next) {
    case "approved":
      push(ctx.seller, `[수산] 본사 승인 완료 — ${ctx.order_no}`,
        `${base}<p>본사 승인이 완료되었습니다. 출하 일정이 곧 확정됩니다.</p>${link}`);
      break;
    case "shipping_scheduled":
      push(ctx.seller, `[수산] 출하일 확정 — ${ctx.order_no}`,
        `${base}<p>출하 예정일: <strong>${formatDate(ctx.ship_date)}</strong></p>${link}`);
      break;
    case "install_scheduled": {
      const detail = `${base}
        <p>장착일: <strong>${formatDate(ctx.install_date)}</strong></p>
        <p>장착 장소: ${ctx.install_location ?? "—"}</p>
        <p>고객 연락처: ${ctx.customer_phone ?? "—"}</p>
        <p>장착자: ${ctx.installer?.name ?? "—"}${ctx.installer?.phone ? ` (${ctx.installer.phone})` : ""}</p>`;
      push(ctx.seller, `[수산] 장착 일정 확정 — ${ctx.order_no}`, `${detail}${link}`);
      push(ctx.installer, `[수산] 장착 배정 — ${formatDate(ctx.install_date)} ${ctx.customer_name ?? ""}`,
        `${detail}<p>일정 확인 후 진행 부탁드립니다.</p>${link}`);
      break;
    }
    case "installed":
      for (const admin of ctx.admins) {
        push(admin, `[수산] 장착 완료 — ${ctx.order_no}`,
          `${base}<p>장착이 완료되었습니다. 구조변경 서류 전달을 진행해주세요.</p>${link}`);
      }
      push(ctx.seller, `[수산] 장착 완료 — ${ctx.order_no}`,
        `${base}<p>장착이 완료되었습니다.</p>${link}`);
      break;
    case "docs_delivered":
      push(ctx.seller, `[수산] 구조변경 서류 전달 완료 — ${ctx.order_no}`,
        `${base}<p>구조변경 서류 전달이 완료되어 판매 건이 종결되었습니다.</p>${link}`);
      break;
    case "canceled":
      push(ctx.seller, `[수산] 주문 취소 — ${ctx.order_no}`, `${base}<p>주문이 취소되었습니다.</p>${link}`);
      push(ctx.installer, `[수산] 주문 취소 — ${ctx.order_no}`, `${base}<p>배정되었던 주문이 취소되었습니다.</p>${link}`);
      break;
  }
  return emails;
}

export async function advanceOrder(formData: FormData) {
  await requireActiveUser();
  const supabase = await createClient();

  const orderId = String(formData.get("orderId") ?? "");
  const next = String(formData.get("next") ?? "") as OrderStatus;
  const note = String(formData.get("note") ?? "") || null;

  const extra: Record<string, string> = {};
  for (const key of ["ship_date", "install_date", "installer_id", "install_location"]) {
    const value = formData.get(key);
    if (value) extra[key] = String(value);
  }

  const { error } = await supabase.rpc("advance_order_status", {
    p_order_id: orderId,
    p_next: next,
    p_note: note ?? undefined,
    p_extra: extra as never,
  });
  if (error) {
    const msg = error.message.includes("TRANSITION_NOT_ALLOWED")
      ? "허용되지 않는 상태 변경입니다."
      : error.message;
    throw new Error(msg);
  }

  // 알림 발송 (실패해도 상태 전이는 유지)
  try {
    const { data } = await supabase.rpc("order_notify_context", { p_order_id: orderId });
    if (data) {
      const ctx = data as unknown as NotifyContext;
      const orderUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/orders/${orderId}`;
      for (const { to, subject, body } of buildEmails(next, ctx, orderUrl)) {
        await sendNotificationEmail({
          supabase,
          type: `order_${next}`,
          to: { email: to.email!, profileId: to.id },
          subject,
          html: emailLayout("판매 진행 알림", body),
          orderId,
          payload: { order_no: ctx.order_no },
        });
      }
    }
  } catch (e) {
    console.error("[orders] 알림 발송 실패:", e);
  }

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
  revalidatePath("/dashboard");
}
