import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireActiveUser } from "@/lib/auth";
import { formatKRW, formatDate } from "@/lib/format";
import { ORDER_STATUS_LABEL, QUOTE_STATUS_LABEL } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "고객 상세" };

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireActiveUser();
  const supabase = await createClient();
  const { id } = await params;

  const { data: customer } = await supabase
    .from("customers")
    .select("*, vehicles(*), quotes(id, quote_no, status, total, created_at)")
    .eq("id", id)
    .single();
  if (!customer) notFound();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_no, status, install_date")
    .eq("customer_id", id)
    .order("created_at", { ascending: false });

  const quotes = [...customer.quotes].sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  );

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-semibold">{customer.name}</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">고객 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>회사/상호: {customer.company_name || "—"}</p>
            <p>연락처: {customer.phone || "—"}</p>
            <p>이메일: {customer.email || "—"}</p>
            <p>주소: {customer.address || "—"}</p>
            <p>사업자번호: {customer.business_reg_no || "—"}</p>
            {customer.memo && (
              <p className="pt-1 text-muted-foreground">메모: {customer.memo}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">차량 ({customer.vehicles.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {!customer.vehicles.length && (
              <p className="text-muted-foreground">
                등록된 차량이 없습니다. (구조변경 단계에서 등록됩니다)
              </p>
            )}
            {customer.vehicles.map((vehicle) => (
              <div key={vehicle.id} className="rounded-md border p-2">
                <p className="font-medium">{vehicle.plate_no || "번호 미등록"}</p>
                <p className="text-muted-foreground">
                  {[vehicle.model, vehicle.year && `${vehicle.year}년식`]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">견적 이력</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {!quotes.length && (
            <p className="text-sm text-muted-foreground">견적 이력이 없습니다.</p>
          )}
          {quotes.map((quote) => (
            <Link
              key={quote.id}
              href={`/quotes/${quote.id}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-sm hover:bg-accent"
            >
              <span className="font-medium">{quote.quote_no}</span>
              <span>{formatKRW(quote.total)}</span>
              <span className="text-muted-foreground">{formatDate(quote.created_at)}</span>
              <Badge variant="outline">{QUOTE_STATUS_LABEL[quote.status]}</Badge>
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">판매/장착 이력</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {!orders?.length && (
            <p className="text-sm text-muted-foreground">판매 이력이 없습니다.</p>
          )}
          {orders?.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-sm hover:bg-accent"
            >
              <span className="font-medium">{order.order_no}</span>
              <span className="text-muted-foreground">
                장착일 {formatDate(order.install_date)}
              </span>
              <Badge variant="outline">{ORDER_STATUS_LABEL[order.status]}</Badge>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
