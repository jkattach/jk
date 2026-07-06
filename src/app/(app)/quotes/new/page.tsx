import { createClient } from "@/lib/supabase/server";
import { requireActiveUser } from "@/lib/auth";
import { QuoteForm } from "@/components/quote-form";

export const metadata = { title: "견적 작성" };

export default async function NewQuotePage() {
  await requireActiveUser();
  const supabase = await createClient();

  const [{ data: products }, { data: customers }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, model_code, price")
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("customers")
      .select("id, name, company_name")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">견적 작성</h1>
      <QuoteForm products={products ?? []} customers={customers ?? []} />
    </div>
  );
}
