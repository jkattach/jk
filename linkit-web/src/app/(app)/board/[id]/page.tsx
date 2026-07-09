import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireActiveUser } from "@/lib/auth";
import { placeBid, withdrawBid } from "@/server/actions/requests";
import { formatDate, formatDateTime, formatKRW } from "@/lib/format";
import { BID_STATUS_LABEL, REQUEST_STATUS_LABEL } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "요청 상세" };

type SellerRequest = {
  id: string;
  request_no: string;
  status: "open" | "closed" | "canceled" | "expired";
  region: string;
  excavator_model: string | null;
  item_name: string;
  details: string | null;
  desired_date: string | null;
  created_at: string;
  bid_count: number;
  lowest_price: number | null;
  my_bid: {
    id: string;
    price: number;
    install_included: boolean;
    valid_until: string | null;
    message: string | null;
    status: keyof typeof BID_STATUS_LABEL;
  } | null;
  customer: { name: string; phone: string; email: string | null } | null;
};

export default async function BoardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireActiveUser();
  if (profile.role === "installer") redirect("/dashboard");

  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_request_for_seller", {
    p_request: id,
  });
  if (!data) notFound();

  const request = data as unknown as SellerRequest;
  const myBid = request.my_bid;
  const canBid =
    request.status === "open" &&
    (!myBid || myBid.status === "submitted" || myBid.status === "withdrawn");

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/board" />}
        >
          <ArrowLeft className="size-4" />
          요청 보드
        </Button>
        <Badge>{REQUEST_STATUS_LABEL[request.status]}</Badge>
      </div>

      <Card>
        <CardContent className="space-y-1.5 pt-6 text-sm">
          <p className="text-base font-semibold">{request.item_name}</p>
          <p className="text-muted-foreground">
            {request.request_no} · {formatDateTime(request.created_at)} 등록
          </p>
          <p>
            지역: {request.region}
            {request.excavator_model && ` · 장비: ${request.excavator_model}`}
            {request.desired_date &&
              ` · 희망 장착일: ${formatDate(request.desired_date)}`}
          </p>
          {request.details && (
            <p className="whitespace-pre-wrap text-muted-foreground">
              {request.details}
            </p>
          )}
          <p className="pt-2 text-xs text-muted-foreground">
            현재 입찰 {request.bid_count}건
            {request.lowest_price !== null &&
              ` · 최저가 ${formatKRW(request.lowest_price)}`}
          </p>
        </CardContent>
      </Card>

      {myBid?.status === "selected" && request.customer && (
        <Alert>
          <AlertDescription>
            <strong>낙찰되었습니다.</strong> 고객: {request.customer.name} (
            {request.customer.phone}
            {request.customer.email && `, ${request.customer.email}`}) — 고객
            목록에 자동 등록되었습니다.{" "}
            <Link href="/quotes/new" className="underline underline-offset-4">
              견적서 작성으로 이동
            </Link>
          </AlertDescription>
        </Alert>
      )}
      {myBid?.status === "not_selected" && (
        <Alert>
          <AlertDescription>
            아쉽지만 이 요청은 다른 대리점으로 확정되었습니다.
          </AlertDescription>
        </Alert>
      )}

      {canBid && (
        <form action={placeBid}>
          <input type="hidden" name="requestId" value={request.id} />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {myBid && myBid.status !== "withdrawn"
                  ? "내 입찰 수정"
                  : "입찰하기"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">견적 금액 (원) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min={1}
                    required
                    defaultValue={myBid?.price ?? ""}
                    placeholder="1000000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validUntil">유효기간</Label>
                  <Input
                    id="validUntil"
                    name="validUntil"
                    type="date"
                    defaultValue={myBid?.valid_until ?? ""}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="installIncluded"
                  defaultChecked={myBid?.install_included ?? true}
                  className="size-4 accent-primary"
                />
                장착비 포함
              </label>
              <div className="space-y-2">
                <Label htmlFor="message">고객에게 전할 메시지</Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={3}
                  maxLength={1000}
                  defaultValue={myBid?.message ?? ""}
                  placeholder="납기, A/S 조건, 장착 경험 등 어필 포인트를 적어주세요."
                />
              </div>
              <Button type="submit" className="w-full">
                {myBid && myBid.status !== "withdrawn"
                  ? "입찰 수정하기"
                  : "입찰 제출하기"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                고객 연락처는 낙찰 시 공개되며, 고객 목록에 자동 등록됩니다.
              </p>
            </CardContent>
          </Card>
        </form>
      )}

      {myBid && myBid.status === "submitted" && request.status === "open" && (
        <form action={withdrawBid} className="text-center">
          <input type="hidden" name="bidId" value={myBid.id} />
          <input type="hidden" name="requestId" value={request.id} />
          <Button type="submit" variant="ghost" size="sm">
            입찰 철회
          </Button>
        </form>
      )}
    </main>
  );
}
