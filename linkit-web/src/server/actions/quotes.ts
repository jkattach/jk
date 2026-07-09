"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireActiveUser } from "@/lib/auth";
import { sendNotificationEmail, emailLayout } from "@/lib/email";
import { formatKRW } from "@/lib/format";

const quoteInputSchema = z.object({
  customerId: z.string().uuid().nullish(),
  newCustomer: z
    .object({
      name: z.string().min(1, "고객명을 입력해주세요."),
      phone: z.string().optional().default(""),
      email: z.string().email("이메일 형식이 올바르지 않습니다.").or(z.literal("")).default(""),
      companyName: z.string().optional().default(""),
    })
    .nullish(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid().nullish(),
        itemName: z.string().min(1, "품목명을 입력해주세요."),
        unitPrice: z.number().min(0),
        qty: z.number().int().min(1),
      })
    )
    .min(1, "품목을 1개 이상 추가해주세요."),
  validUntil: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

export type QuoteInput = z.infer<typeof quoteInputSchema>;

export async function createQuote(rawInput: QuoteInput) {
  const profile = await requireActiveUser();
  if (profile.role === "installer") throw new Error("권한이 없습니다.");

  const input = quoteInputSchema.parse(rawInput);
  const supabase = await createClient();

  // 고객: 기존 선택 또는 신규 등록
  let customerId = input.customerId ?? null;
  let snapshot: Record<string, string> = {};

  if (!customerId) {
    if (!input.newCustomer?.name) throw new Error("고객을 선택하거나 입력해주세요.");
    const { data: customer, error } = await supabase
      .from("customers")
      .insert({
        owner_id: profile.id,
        name: input.newCustomer.name,
        phone: input.newCustomer.phone || null,
        email: input.newCustomer.email || null,
        company_name: input.newCustomer.companyName || null,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    customerId = customer.id;
    snapshot = {
      name: customer.name,
      phone: customer.phone ?? "",
      email: customer.email ?? "",
      company_name: customer.company_name ?? "",
    };
  } else {
    const { data: customer, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single();
    if (error) throw new Error("고객 정보를 찾을 수 없습니다.");
    snapshot = {
      name: customer.name,
      phone: customer.phone ?? "",
      email: customer.email ?? "",
      company_name: customer.company_name ?? "",
    };
  }

  const items = input.items.map((item, i) => ({
    product_id: item.productId ?? null,
    item_name: item.itemName,
    unit_price: item.unitPrice,
    qty: item.qty,
    amount: item.unitPrice * item.qty,
    sort_order: i,
  }));
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const vat = Math.round(subtotal * 0.1);

  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .insert({
      seller_id: profile.id,
      customer_id: customerId,
      customer_snapshot: snapshot,
      valid_until: input.validUntil || null,
      notes: input.notes || null,
      subtotal,
      vat,
      total: subtotal + vat,
    })
    .select("id")
    .single();
  if (quoteError) throw new Error(quoteError.message);

  const { error: itemsError } = await supabase
    .from("quote_items")
    .insert(items.map((item) => ({ ...item, quote_id: quote.id })));
  if (itemsError) throw new Error(itemsError.message);

  revalidatePath("/quotes");
  redirect(`/quotes/${quote.id}`);
}

// 링크 발송: 상태 sent 전환 + 고객 이메일 발송(있는 경우)
export async function sendQuote(formData: FormData) {
  const profile = await requireActiveUser();
  const quoteId = String(formData.get("quoteId") ?? "");
  const supabase = await createClient();

  const { data: quote, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", quoteId)
    .single();
  if (error) throw new Error("견적서를 찾을 수 없습니다.");
  if (quote.status !== "draft" && quote.status !== "sent") {
    throw new Error("발송할 수 없는 상태입니다.");
  }

  const { error: updateError } = await supabase
    .from("quotes")
    .update({ status: "sent", sent_at: quote.sent_at ?? new Date().toISOString() })
    .eq("id", quoteId);
  if (updateError) throw new Error(updateError.message);

  const snapshot = quote.customer_snapshot as Record<string, string>;
  const customerEmail = snapshot?.email;
  if (customerEmail) {
    const url = `${process.env.NEXT_PUBLIC_SITE_URL}/q/${quote.share_token}`;
    await sendNotificationEmail({
      supabase,
      type: "quote_sent",
      to: { email: customerEmail },
      subject: `[수산] 견적서가 도착했습니다 (${quote.quote_no})`,
      html: emailLayout(
        "견적서 안내",
        `<p>${snapshot.name ?? "고객"}님, 요청하신 견적서를 보내드립니다.</p>
         <p>견적 금액: <strong>${formatKRW(quote.total)}</strong> (VAT 포함)</p>
         <p><a href="${url}" style="display:inline-block;background:#1a1a1a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none">견적서 확인하기</a></p>
         <p style="font-size:13px;color:#666">담당: ${profile.name}${profile.phone ? ` (${profile.phone})` : ""}</p>`
      ),
      quoteId: quote.id,
      payload: { quote_no: quote.quote_no },
    });
  }

  revalidatePath(`/quotes/${quoteId}`);
}

// 고객이 공개 페이지에서 구매 확정 (비로그인, anon 클라이언트 + definer RPC)
export async function confirmQuoteByToken(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  if (!token) throw new Error("잘못된 요청입니다.");

  const supabase = await createClient();
  const { error } = await supabase.rpc("confirm_quote", { p_token: token });
  if (error) throw new Error("견적 확정에 실패했습니다: " + error.message);

  // 알림: 관리자 전원 + 담당 판매자
  const { data: ctx } = await supabase.rpc("quote_notify_context", { p_token: token });
  if (ctx) {
    const context = ctx as {
      quote_id: string;
      quote_no: string;
      total: number;
      customer_snapshot: Record<string, string>;
      seller: { id: string; name: string; email: string | null };
      admins: { id: string; name: string; email: string }[];
    };
    const customerName = context.customer_snapshot?.name ?? "고객";
    const html = emailLayout(
      "구매 확정 알림",
      `<p>견적 <strong>${context.quote_no}</strong> 건이 고객(${customerName})에 의해 구매 확정되었습니다.</p>
       <p>금액: <strong>${formatKRW(context.total)}</strong> (VAT 포함)</p>
       <p>관리자 승인 후 출하·장착 일정을 진행해주세요.</p>
       <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/orders">주문 관리 바로가기</a></p>`
    );
    const recipients = [
      ...context.admins.map((admin) => ({ email: admin.email, profileId: admin.id })),
      ...(context.seller?.email
        ? [{ email: context.seller.email, profileId: context.seller.id }]
        : []),
    ];
    for (const to of recipients) {
      await sendNotificationEmail({
        supabase,
        type: "quote_confirmed",
        to,
        subject: `[수산] 구매 확정 — ${context.quote_no}`,
        html,
        quoteId: context.quote_id,
        payload: { quote_no: context.quote_no },
      });
    }
  }

  revalidatePath(`/q/${token}`);
}
