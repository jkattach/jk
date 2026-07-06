import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { confirmQuoteByToken } from "@/server/actions/quotes";
import { QUOTE_STATUS_LABEL } from "@/lib/labels";
import { QuoteView, type QuoteViewData } from "@/components/quote-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "견적서",
  robots: { index: false, follow: false }, // 개인정보·가격 포함 — 검색 노출 금지
};

type TokenQuote = {
  quote: {
    id: string;
    quote_no: string;
    status: "sent" | "viewed" | "confirmed" | "expired" | "canceled";
    customer_snapshot: Record<string, string>;
    valid_until: string | null;
    subtotal: number;
    vat: number;
    total: number;
    notes: string | null;
    created_at: string;
    confirmed_at: string | null;
  };
  items: QuoteViewData["items"];
  seller: QuoteViewData["seller"];
};

export default async function PublicQuotePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_quote_by_token", { p_token: token });

  if (!data) {
    return (
      <main className="flex flex-1 items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-xl font-semibold">견적서를 찾을 수 없습니다</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            링크가 잘못되었거나 아직 발송되지 않은 견적입니다. 담당 판매자에게
            문의해주세요.
          </p>
        </div>
      </main>
    );
  }

  const { quote, items, seller } = data as unknown as TokenQuote;
  const viewData: QuoteViewData = { ...quote, items, seller };
  const expired =
    quote.valid_until && new Date(quote.valid_until) < new Date(new Date().toDateString());
  const confirmable = (quote.status === "sent" || quote.status === "viewed") && !expired;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">수산 회전링크 견적서</h1>
        <Badge>{QUOTE_STATUS_LABEL[quote.status]}</Badge>
      </div>

      {quote.status === "confirmed" && (
        <Alert>
          <AlertDescription>
            구매가 확정된 견적입니다. 담당 판매자가 곧 연락드릴 예정입니다.
          </AlertDescription>
        </Alert>
      )}
      {expired && quote.status !== "confirmed" && (
        <Alert variant="destructive">
          <AlertDescription>
            견적 유효기간이 지났습니다. 담당 판매자에게 재견적을 요청해주세요.
          </AlertDescription>
        </Alert>
      )}

      <div className="rounded-lg border bg-card p-4 md:p-6">
        <QuoteView data={viewData} />
      </div>

      {confirmable && (
        <form action={confirmQuoteByToken} className="sticky bottom-4">
          <input type="hidden" name="token" value={token} />
          <Button type="submit" size="lg" className="w-full shadow-lg">
            이 견적으로 구매 확정하기
          </Button>
        </form>
      )}
    </main>
  );
}
