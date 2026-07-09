import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QuoteView, type QuoteViewData } from "@/components/quote-view";
import { PrintButton } from "@/components/print-button";

export const metadata = { title: "견적서 출력" };

export default async function QuotePrintPage({
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
    <div className="mx-auto max-w-[210mm] space-y-4 p-6 print:p-0">
      <div className="flex justify-end print:hidden">
        <PrintButton />
      </div>
      <div className="rounded-lg border p-8 print:rounded-none print:border-0 print:p-0">
        <QuoteView data={viewData} />
      </div>
    </div>
  );
}
