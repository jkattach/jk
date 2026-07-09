import Link from "next/link";
import { redirect } from "next/navigation";
import { Gavel } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireActiveUser } from "@/lib/auth";
import { formatDate, formatDateTime, formatKRW } from "@/lib/format";
import { BID_STATUS_LABEL } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "요청 보드" };

type OpenRequest = {
  id: string;
  request_no: string;
  region: string;
  excavator_model: string | null;
  item_name: string;
  details: string | null;
  desired_date: string | null;
  created_at: string;
  bid_count: number;
  lowest_price: number | null;
  my_bid: { id: string; price: number; status: keyof typeof BID_STATUS_LABEL } | null;
};

export default async function BoardPage() {
  const profile = await requireActiveUser();
  if (profile.role === "installer") redirect("/dashboard");

  const supabase = await createClient();
  const { data } = await supabase.rpc("list_open_requests");
  const requests = (data as unknown as OpenRequest[] | null) ?? [];

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">견적 요청 보드</h1>
        <p className="text-sm text-muted-foreground">
          소비자 견적 요청에 입찰하세요. 고객 연락처는 낙찰 시 공개됩니다.
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-24 text-muted-foreground">
          <Gavel className="size-10" />
          현재 입찰 가능한 요청이 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <Link key={request.id} href={`/board/${request.id}`} className="block">
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="pt-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {request.item_name}
                        {request.my_bid && (
                          <Badge
                            variant={
                              request.my_bid.status === "submitted"
                                ? "secondary"
                                : "outline"
                            }
                            className="ml-2"
                          >
                            내 입찰 {formatKRW(request.my_bid.price)} ·{" "}
                            {BID_STATUS_LABEL[request.my_bid.status]}
                          </Badge>
                        )}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {request.request_no} · {request.region}
                        {request.excavator_model && ` · ${request.excavator_model}`}
                        {request.desired_date &&
                          ` · 희망 ${formatDate(request.desired_date)}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(request.created_at)} 등록
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-muted-foreground">
                        입찰 {request.bid_count}건
                      </p>
                      {request.lowest_price !== null && (
                        <p className="font-medium">
                          최저 {formatKRW(request.lowest_price)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
