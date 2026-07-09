"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireActiveUser } from "@/lib/auth";
import { sendNotificationEmail, emailLayout } from "@/lib/email";
import { formatKRW } from "@/lib/format";

// ── 소비자: 견적 요청 등록 (비로그인, anon 클라이언트 + definer RPC) ──

const requestInputSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요.").max(50),
  phone: z.string().min(8, "연락처를 입력해주세요.").max(30),
  email: z.string().email("이메일 형식이 올바르지 않습니다.").or(z.literal("")).default(""),
  region: z.string().min(1, "지역을 입력해주세요.").max(100),
  itemName: z.string().min(1, "원하는 품목을 입력해주세요.").max(100),
  excavatorModel: z.string().max(100).optional().default(""),
  details: z.string().max(2000).optional().default(""),
  desiredDate: z.string().optional().default(""),
});

export async function createRequest(formData: FormData) {
  const input = requestInputSchema.parse({
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    region: String(formData.get("region") ?? ""),
    itemName: String(formData.get("itemName") ?? ""),
    excavatorModel: String(formData.get("excavatorModel") ?? ""),
    details: String(formData.get("details") ?? ""),
    desiredDate: String(formData.get("desiredDate") ?? ""),
  });

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_quote_request", {
    p_name: input.name,
    p_phone: input.phone,
    p_region: input.region,
    p_item_name: input.itemName,
    p_email: input.email || undefined,
    p_excavator_model: input.excavatorModel || undefined,
    p_details: input.details || undefined,
    p_desired_date: input.desiredDate || undefined,
  });
  if (error) throw new Error("요청 등록에 실패했습니다: " + error.message);

  const result = data as unknown as {
    id: string;
    request_no: string;
    share_token: string;
    admins: { id: string; name: string; email: string }[];
  };

  // 관리자에게 새 요청 알림
  for (const admin of result.admins ?? []) {
    await sendNotificationEmail({
      supabase,
      type: "request_created",
      to: { email: admin.email, profileId: admin.id },
      subject: `[착착] 새 견적 요청 — ${result.request_no}`,
      html: emailLayout(
        "새 견적 요청",
        `<p>새 견적 요청이 등록되었습니다.</p>
         <p>요청 번호: <strong>${result.request_no}</strong> / 품목: ${input.itemName} / 지역: ${input.region}</p>
         <p>딜러들의 입찰 참여를 확인해주세요.</p>`
      ),
      requestId: result.id,
      payload: { request_no: result.request_no },
    });
  }

  redirect(`/r/${result.share_token}?created=1`);
}

// ── 딜러: 입찰 제출/수정 ──────────────────────────────────

const bidInputSchema = z.object({
  requestId: z.string().uuid(),
  price: z.number().int().min(1, "금액을 입력해주세요."),
  installIncluded: z.boolean(),
  validUntil: z.string().optional().default(""),
  message: z.string().max(1000).optional().default(""),
});

export async function placeBid(formData: FormData) {
  const profile = await requireActiveUser();
  if (profile.role !== "seller" && profile.role !== "admin") {
    throw new Error("딜러(판매자)만 입찰할 수 있습니다.");
  }

  const input = bidInputSchema.parse({
    requestId: String(formData.get("requestId") ?? ""),
    price: Number(String(formData.get("price") ?? "0").replace(/[^0-9]/g, "")),
    installIncluded: formData.get("installIncluded") === "on",
    validUntil: String(formData.get("validUntil") ?? ""),
    message: String(formData.get("message") ?? ""),
  });

  const supabase = await createClient();

  // 기존 입찰이 있으면 갱신(재제출), 없으면 신규 제출
  const { data: existing } = await supabase
    .from("bids")
    .select("id, status")
    .eq("request_id", input.requestId)
    .eq("seller_id", profile.id)
    .maybeSingle();

  if (existing) {
    if (existing.status === "selected" || existing.status === "not_selected") {
      throw new Error("이미 마감된 입찰입니다.");
    }
    const { error } = await supabase
      .from("bids")
      .update({
        price: input.price,
        install_included: input.installIncluded,
        valid_until: input.validUntil || null,
        message: input.message || null,
        status: "submitted",
      })
      .eq("id", existing.id);
    if (error) throw new Error("입찰 수정에 실패했습니다: " + error.message);
  } else {
    const { error } = await supabase.from("bids").insert({
      request_id: input.requestId,
      seller_id: profile.id,
      price: input.price,
      install_included: input.installIncluded,
      valid_until: input.validUntil || null,
      message: input.message || null,
    });
    if (error) throw new Error("입찰 제출에 실패했습니다: " + error.message);
  }

  // 소비자에게 새 입찰 도착 알림 (이메일 등록된 경우)
  const { data: ctx } = await supabase.rpc("bid_notify_context", {
    p_request: input.requestId,
  });
  const context = ctx as unknown as {
    request_no: string;
    share_token: string;
    item_name: string;
    customer_name: string;
    customer_email: string | null;
  } | null;
  if (context?.customer_email) {
    const url = `${process.env.NEXT_PUBLIC_SITE_URL}/r/${context.share_token}`;
    await sendNotificationEmail({
      supabase,
      type: "bid_placed",
      to: { email: context.customer_email },
      subject: `[착착] 새 견적이 도착했습니다 (${context.request_no})`,
      html: emailLayout(
        "새 견적 도착",
        `<p>${context.customer_name}님, 요청하신 <strong>${context.item_name}</strong> 건에 새 견적이 도착했습니다.</p>
         <p>견적 금액: <strong>${formatKRW(input.price)}</strong></p>
         <p><a href="${url}" style="display:inline-block;background:#1a1a1a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none">견적 비교하러 가기</a></p>`
      ),
      requestId: input.requestId,
      payload: { request_no: context.request_no, price: input.price },
    });
  }

  revalidatePath("/board");
  revalidatePath(`/board/${input.requestId}`);
}

// ── 딜러: 입찰 철회 ──────────────────────────────────────

export async function withdrawBid(formData: FormData) {
  await requireActiveUser();
  const bidId = String(formData.get("bidId") ?? "");
  const requestId = String(formData.get("requestId") ?? "");

  const supabase = await createClient();
  const { error } = await supabase
    .from("bids")
    .update({ status: "withdrawn" })
    .eq("id", bidId);
  if (error) throw new Error("철회에 실패했습니다: " + error.message);

  revalidatePath("/board");
  revalidatePath(`/board/${requestId}`);
}

// ── 소비자: 입찰 선택(낙찰) — 비로그인, definer RPC ────────

export async function selectBidByToken(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const bidId = String(formData.get("bidId") ?? "");
  if (!token || !bidId) throw new Error("잘못된 요청입니다.");

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("select_bid_by_token", {
    p_token: token,
    p_bid: bidId,
  });
  if (error) throw new Error("선택 처리에 실패했습니다: " + error.message);

  const result = data as unknown as {
    request_id?: string;
    request_no: string;
    item_name?: string;
    region?: string;
    price: number;
    already: boolean;
    seller: {
      id?: string;
      name: string;
      org_name: string | null;
      phone: string | null;
      email: string | null;
    };
    admins: { id: string; name: string; email: string }[];
  };

  // 낙찰 딜러 + 관리자 알림 (신규 확정 건만)
  if (!result.already && result.request_id) {
    const recipients = [
      ...(result.seller?.email
        ? [{ email: result.seller.email, profileId: result.seller.id }]
        : []),
      ...(result.admins ?? []).map((admin) => ({
        email: admin.email,
        profileId: admin.id,
      })),
    ];
    const html = emailLayout(
      "낙찰 알림",
      `<p>요청 <strong>${result.request_no}</strong> 건이 낙찰되었습니다.</p>
       <p>품목: ${result.item_name ?? "-"} / 지역: ${result.region ?? "-"} / 금액: <strong>${formatKRW(result.price)}</strong></p>
       <p>낙찰 딜러: ${result.seller?.org_name ?? result.seller?.name ?? "-"}</p>
       <p>고객 연락처는 요청 상세에서 확인할 수 있습니다. 고객 목록에도 자동 등록되었습니다.</p>
       <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/board/${result.request_id}">요청 상세 보기</a></p>`
    );
    for (const to of recipients) {
      await sendNotificationEmail({
        supabase,
        type: "bid_selected",
        to,
        subject: `[착착] 낙찰 확정 — ${result.request_no}`,
        html,
        requestId: result.request_id,
        payload: { request_no: result.request_no, price: result.price },
      });
    }
  }

  revalidatePath(`/r/${token}`);
}
