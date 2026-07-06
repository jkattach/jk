import Link from "next/link";
import { notFound } from "next/navigation";
import { Printer, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { sendQuote } from "@/server/actions/quotes";
import { QUOTE_STATUS_LABEL } from "@/lib/labels";
import { formatDateTime } from "@/lib/format";
import { QuoteView, type QuoteViewData } from "@/components/quote-view";
import { CopyLinkButton } from "@/components/copy-link-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const metadata = { title: "견적 상세" };

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: quote } = await supabase
    .from("quotes")
    .select("*, quote_items(*), profiles!quotes_seller_id_fkey(name, org_name, phone)")
    .eq("id", id)
    .single();
  if (!quote) notFound();

  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/q/${quote.share_token}`;
  const viewData: QuoteViewData = {
    quote_no: quote.quote_no,
    created_at: quote.created_at,
    valid_until: quote.valid_until,
    subtotal: quote.subtotal,
    vat: quote.vat,
    total: quote.total,
    notes: quote.notes,
    customer_snapshot: quote.customer_snapshot as Record<string, string>,
    seller: quote.profiles,
    items: [...quote.quote_items].sort((a, b) => a.sort_order - b.sort_order),
  };

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">{quote.quote_no}</h1>
          <Badge>{QUOTE_STATUS_LABEL[quote.status]}</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyLinkButton url={shareUrl} />
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/quotes/${quote.id}/print`} target="_blank" />}
          >
            <Printer className="size-4" />
            출력
          </Button>
          {(quote.status === "draft" || quote.status === "sent") && (
            <form action={sendQuote}>
              <input type="hidden" name="quoteId" value={quote.id} />
              <Button type="submit">
                <Send className="size-4" />
                {quote.status === "draft" ? "링크 발송" : "재발송"}
              </Button>
            </form>
          )}
        </div>
      </div>

      {quote.status === "draft" && (
        <Alert>
          <AlertDescription>
            아직 발송 전입니다. [링크 발송]을 누르면 고객이 링크로 견적서를 열람하고
            구매 확정할 수 있습니다.
            {(quote.customer_snapshot as Record<string, string>)?.email
              ? " 고객 이메일로도 링크가 발송됩니다."
              : " (고객 이메일이 없어 링크 복사로 직접 전달해주세요.)"}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-1 text-sm text-muted-foreground">
        {quote.sent_at && <p>발송: {formatDateTime(quote.sent_at)}</p>}
        {quote.viewed_at && <p>고객 열람: {formatDateTime(quote.viewed_at)}</p>}
        {quote.confirmed_at && <p>구매 확정: {formatDateTime(quote.confirmed_at)}</p>}
      </div>

      <div className="rounded-lg border p-4 md:p-6">
        <QuoteView data={viewData} />
      </div>
    </div>
  );
}
