import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { selectBidByToken } from "@/server/actions/requests";
import { REQUEST_STATUS_LABEL } from "@/lib/labels";
import { formatKRW, formatDate, formatDateTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { CopyLinkButton } from "@/components/copy-link-button";

export const metadata: Metadata = {
  title: "내 견적 요청 — 착착",
  robots: { index: false, follow: false }, // 개인 요청 페이지 — 검색 노출 금지
};

type TokenRequest = {
  request: {
    id: string;
    request_no: string;
    status: "open" | "closed" | "canceled" | "expired";
    customer_name: string;
    region: string;
    excavator_model: string | null;
    item_name: string;
    details: string | null;
    desired_date: string | null;
    selected_bid_id: string | null;
    created_at: string;
  };
  bids: {
    id: string;
    price: number;
    install_included: boolean;
    valid_until: string | null;
    message: string | null;
    status: "submitted" | "selected" | "not_selected";
    seller_org: string;
    seller_phone: string | null;
    seller_name: string | null;
    created_at: string;
  }[];
};

export default async function PublicRequestPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { token } = await params;
  const { created } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_request_by_token", {
    p_token: token,
  });

  if (!data) {
    return (
      <main className="flex flex-1 items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-xl font-semibold">요청을 찾을 수 없습니다</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            링크가 잘못되었거나 삭제된 요청입니다.
          </p>
        </div>
      </main>
    );
  }

  const { request, bids } = data as unknown as TokenRequest;
  const selectedBid = bids.find((bid) => bid.status === "selected");

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">내 견적 요청</h1>
        <Badge>{REQUEST_STATUS_LABEL[request.status]}</Badge>
      </div>

      {created && (
        <Alert>
          <AlertDescription>
            요청이 등록되었습니다. 이 페이지 주소를 저장해두세요 — 대리점들의
            견적이 이곳에 모입니다.
            <span className="mt-2 block">
              <CopyLinkButton
                url={`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/r/${token}`}
              />
            </span>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="space-y-1.5 pt-6 text-sm">
          <p className="text-base font-semibold">{request.item_name}</p>
          <p className="text-muted-foreground">
            요청 번호 {request.request_no} · {formatDateTime(request.created_at)}
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
        </CardContent>
      </Card>

      {selectedBid && (
        <Alert>
          <AlertDescription>
            <strong>{selectedBid.seller_org}</strong> 견적(
            {formatKRW(selectedBid.price)})으로 확정되었습니다.
            {selectedBid.seller_phone && (
              <>
                {" "}
                담당자: {selectedBid.seller_name} ({selectedBid.seller_phone})
              </>
            )}{" "}
            대리점에서 곧 연락드릴 예정입니다.
          </AlertDescription>
        </Alert>
      )}

      <div>
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">
          도착한 견적 {bids.length}건{" "}
          {request.status === "open" && bids.length > 0 && "· 낮은 가격순"}
        </h2>

        {bids.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              아직 도착한 견적이 없습니다. 대리점들이 요청을 확인하는 중입니다.
              {request.status === "open" && " 잠시 후 다시 확인해주세요."}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {bids.map((bid, index) => (
              <Card
                key={bid.id}
                className={
                  bid.status === "selected" ? "border-primary" : undefined
                }
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {bid.seller_org}
                        {index === 0 && request.status === "open" && (
                          <Badge variant="secondary" className="ml-2">
                            최저가
                          </Badge>
                        )}
                        {bid.status === "selected" && (
                          <Badge className="ml-2">선택됨</Badge>
                        )}
                      </p>
                      <p className="mt-1 text-xl font-bold">
                        {formatKRW(bid.price)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {bid.install_included ? "장착비 포함" : "장착비 별도"}
                        {bid.valid_until &&
                          ` · ${formatDate(bid.valid_until)}까지 유효`}
                      </p>
                      {bid.message && (
                        <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                          {bid.message}
                        </p>
                      )}
                    </div>
                    {request.status === "open" && (
                      <form action={selectBidByToken}>
                        <input type="hidden" name="token" value={token} />
                        <input type="hidden" name="bidId" value={bid.id} />
                        <Button type="submit" size="sm">
                          이 견적 선택
                        </Button>
                      </form>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {request.status === "open" && (
        <p className="text-center text-xs text-muted-foreground">
          견적을 선택하면 해당 대리점에게만 연락처가 전달되고, 대리점 연락처가
          공개됩니다.
        </p>
      )}
    </main>
  );
}
