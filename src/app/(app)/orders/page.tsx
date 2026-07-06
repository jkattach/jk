import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireActiveUser } from "@/lib/auth";
import { formatKRW, formatDate } from "@/lib/format";
import { ORDER_STATUS_LABEL } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "판매/장착 관리" };

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  purchase_confirmed: "secondary",
  approved: "outline",
  shipping_scheduled: "outline",
  install_scheduled: "outline",
  installed: "default",
  docs_delivered: "default",
  canceled: "destructive",
};

export default async function OrdersPage() {
  const profile = await requireActiveUser();
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select(
      `*, quotes(quote_no, total, customer_snapshot),
       installer:profiles!orders_installer_id_fkey(name),
       seller:profiles!orders_seller_id_fkey(name)`
    )
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">판매/장착 관리</h1>
        <p className="text-sm text-muted-foreground">
          {profile.role === "installer"
            ? "나에게 배정된 장착 건입니다."
            : "구매 확정된 판매 건의 진행 상황입니다."}
        </p>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>주문번호</TableHead>
              <TableHead>고객</TableHead>
              <TableHead>금액</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>장착일</TableHead>
              <TableHead>담당</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.map((order) => {
              const snapshot = order.quotes?.customer_snapshot as Record<string, string>;
              return (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link
                      href={`/orders/${order.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {order.order_no}
                    </Link>
                  </TableCell>
                  <TableCell>{snapshot?.name ?? "—"}</TableCell>
                  <TableCell>{order.quotes ? formatKRW(order.quotes.total) : "—"}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[order.status] ?? "secondary"}>
                      {ORDER_STATUS_LABEL[order.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(order.install_date)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    판매 {order.seller?.name ?? "—"}
                    {order.installer ? ` / 장착 ${order.installer.name}` : ""}
                  </TableCell>
                </TableRow>
              );
            })}
            {!orders?.length && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  진행 중인 판매 건이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
