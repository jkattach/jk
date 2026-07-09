import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireActiveUser } from "@/lib/auth";
import { formatDate, formatKRW } from "@/lib/format";
import { ORDER_STATUS_LABEL, QUOTE_STATUS_LABEL, ROLE_LABEL } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "대시보드" };

export default async function DashboardPage() {
  const profile = await requireActiveUser();
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: orders }, { data: quotes }, { data: upcoming }] = await Promise.all([
    supabase.from("orders").select("id, status"),
    supabase.from("quotes").select("id, status, total"),
    supabase
      .from("orders")
      .select("id, order_no, install_date, install_location, status, quotes(customer_snapshot)")
      .gte("install_date", today)
      .in("status", ["install_scheduled"])
      .order("install_date")
      .limit(5),
  ]);

  const inProgress =
    orders?.filter((o) => !["docs_delivered", "canceled"].includes(o.status)) ?? [];
  const awaitingApproval = orders?.filter((o) => o.status === "purchase_confirmed") ?? [];
  const openQuotes = quotes?.filter((q) => ["sent", "viewed"].includes(q.status)) ?? [];
  const confirmedTotal =
    quotes?.filter((q) => q.status === "confirmed").reduce((sum, q) => sum + q.total, 0) ?? 0;

  const stats: { label: string; value: string; href: string; sub?: string }[] = [
    { label: "진행 중 판매 건", value: `${inProgress.length}건`, href: "/orders" },
    ...(profile.role !== "installer"
      ? [
          { label: "회신 대기 견적", value: `${openQuotes.length}건`, href: "/quotes" },
          {
            label: "확정 매출(누적)",
            value: formatKRW(confirmedTotal),
            href: "/quotes",
            sub: "VAT 포함",
          },
        ]
      : []),
    ...(profile.role === "admin"
      ? [{ label: "승인 대기", value: `${awaitingApproval.length}건`, href: "/orders" }]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">대시보드</h1>
        <p className="text-sm text-muted-foreground">
          {profile.name || profile.email}님 ({ROLE_LABEL[profile.role]})
          {profile.role !== "admin" && " — 본인 담당 데이터만 표시됩니다."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <CardDescription>{stat.label}</CardDescription>
                <CardTitle className="text-2xl">{stat.value}</CardTitle>
                {stat.sub && (
                  <p className="text-xs text-muted-foreground">{stat.sub}</p>
                )}
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">다가오는 장착 일정</CardTitle>
        </CardHeader>
        <CardContent>
          {!upcoming?.length ? (
            <p className="text-sm text-muted-foreground">예정된 장착 일정이 없습니다.</p>
          ) : (
            <ul className="space-y-2">
              {upcoming.map((order) => {
                const snapshot = order.quotes?.customer_snapshot as Record<string, string>;
                return (
                  <li key={order.id}>
                    <Link
                      href={`/orders/${order.id}`}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-sm hover:bg-accent"
                    >
                      <span className="font-medium">
                        {formatDate(order.install_date)} — {snapshot?.name ?? "고객"}
                      </span>
                      <span className="text-muted-foreground">
                        {order.install_location ?? ""}
                      </span>
                      <Badge variant="outline">{ORDER_STATUS_LABEL[order.status]}</Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {profile.role !== "installer" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">견적 현황</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 text-sm">
            {(["draft", "sent", "viewed", "confirmed"] as const).map((status) => {
              const count = quotes?.filter((q) => q.status === status).length ?? 0;
              return (
                <Badge key={status} variant="secondary">
                  {QUOTE_STATUS_LABEL[status]} {count}
                </Badge>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
