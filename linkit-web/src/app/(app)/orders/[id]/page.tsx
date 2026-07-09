import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireActiveUser } from "@/lib/auth";
import { advanceOrder } from "@/server/actions/orders";
import { formatKRW, formatDate, formatDateTime } from "@/lib/format";
import { ORDER_STATUS_LABEL } from "@/lib/labels";
import { ORDER_TRANSITIONS, ORDER_FLOW } from "@/lib/workflow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const metadata = { title: "주문 상세" };

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireActiveUser();
  const supabase = await createClient();
  const { id } = await params;

  const { data: order } = await supabase
    .from("orders")
    .select(
      `*, quotes(quote_no, total, customer_snapshot, quote_items(*)),
       installer:profiles!orders_installer_id_fkey(id, name, phone),
       seller:profiles!orders_seller_id_fkey(id, name, phone, org_name)`
    )
    .eq("id", id)
    .single();
  if (!order) notFound();

  const { data: history } = await supabase
    .from("order_status_history")
    .select("*, profiles(name)")
    .eq("order_id", id)
    .order("created_at", { ascending: true });

  // 다음 액션: 관리자 or 배정 장착자
  const transitions = ORDER_TRANSITIONS[order.status] ?? [];
  const available = transitions.filter((t) =>
    t.actor === "admin"
      ? profile.role === "admin"
      : profile.role === "admin" ||
        (profile.role === "installer" && order.installer_id === profile.id)
  );

  // 장착자 지정 폼에 필요한 활성 장착자 목록 (관리자만 조회 가능)
  const needsInstallerPicker = available.some((t) =>
    t.requiredFields.includes("installer_id")
  );
  const { data: installers } = needsInstallerPicker
    ? await supabase
        .from("profiles")
        .select("id, name, org_name")
        .eq("role", "installer")
        .eq("status", "active")
    : { data: null };

  const snapshot = order.quotes?.customer_snapshot as Record<string, string>;
  const flowIndex = ORDER_FLOW.indexOf(order.status);

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">{order.order_no}</h1>
          <Badge variant={order.status === "canceled" ? "destructive" : "default"}>
            {ORDER_STATUS_LABEL[order.status]}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href={`/quotes/${order.quote_id}`} />}
        >
          견적서 보기
        </Button>
      </div>

      {/* 진행 단계 표시 */}
      {order.status !== "canceled" && (
        <div className="flex items-center gap-1 overflow-x-auto rounded-md border p-3 text-xs">
          {ORDER_FLOW.map((status, i) => (
            <div key={status} className="flex shrink-0 items-center gap-1">
              {i > 0 && <div className="h-px w-4 bg-border" />}
              <div
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-1",
                  i <= flowIndex
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground"
                )}
              >
                {i <= flowIndex ? (
                  <CheckCircle2 className="size-3.5" />
                ) : (
                  <Circle className="size-3.5" />
                )}
                {ORDER_STATUS_LABEL[status]}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">고객 / 차량</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{snapshot?.name ?? "—"}</p>
            {snapshot?.company_name && <p>{snapshot.company_name}</p>}
            {snapshot?.phone && <p>{snapshot.phone}</p>}
            <p className="pt-2 text-muted-foreground">
              금액: {order.quotes ? formatKRW(order.quotes.total) : "—"} (VAT 포함)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">일정 / 담당</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>출하 예정일: {formatDate(order.ship_date)}</p>
            <p>장착일: {formatDate(order.install_date)}</p>
            <p>장착 장소: {order.install_location ?? "—"}</p>
            <p className="pt-2">
              판매자: {order.seller?.name ?? "—"}
              {order.seller?.org_name ? ` (${order.seller.org_name})` : ""}
            </p>
            <p>
              장착자: {order.installer?.name ?? "미배정"}
              {order.installer?.phone ? ` (${order.installer.phone})` : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 다음 단계 액션 */}
      {available.map((transition) => (
        <Card key={transition.next} className="border-primary/40">
          <CardHeader>
            <CardTitle className="text-base">다음 단계: {transition.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={advanceOrder} className="space-y-3">
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="next" value={transition.next} />
              <p className="text-sm text-muted-foreground">{transition.description}</p>

              <div className="grid gap-3 sm:grid-cols-2">
                {transition.requiredFields.includes("ship_date") && (
                  <div className="space-y-1.5">
                    <Label htmlFor="ship_date">출하 예정일 *</Label>
                    <Input id="ship_date" name="ship_date" type="date" required />
                  </div>
                )}
                {transition.requiredFields.includes("install_date") && (
                  <div className="space-y-1.5">
                    <Label htmlFor="install_date">장착일 *</Label>
                    <Input id="install_date" name="install_date" type="date" required />
                  </div>
                )}
                {transition.requiredFields.includes("installer_id") && (
                  <div className="space-y-1.5">
                    <Label>장착자 *</Label>
                    <Select name="installer_id" required>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="장착자 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {installers?.map((installer) => (
                          <SelectItem key={installer.id} value={installer.id}>
                            {installer.name}
                            {installer.org_name ? ` (${installer.org_name})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!installers?.length && (
                      <p className="text-xs text-destructive">
                        활성 상태의 장착자가 없습니다. 회원 관리에서 장착자를 승인해주세요.
                      </p>
                    )}
                  </div>
                )}
                {transition.requiredFields.includes("install_location") && (
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="install_location">장착 장소 *</Label>
                    <Input
                      id="install_location"
                      name="install_location"
                      placeholder="예: 수산 본사 공장 / 고객 지정 정비소"
                      required
                    />
                  </div>
                )}
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="note">메모 (선택)</Label>
                  <Input id="note" name="note" placeholder="이력에 남길 메모" />
                </div>
              </div>

              <Button type="submit">{transition.label} 처리</Button>
            </form>
          </CardContent>
        </Card>
      ))}

      {/* 취소 (관리자, 종결 전) */}
      {profile.role === "admin" &&
        order.status !== "docs_delivered" &&
        order.status !== "canceled" && (
          <form action={advanceOrder}>
            <input type="hidden" name="orderId" value={order.id} />
            <input type="hidden" name="next" value="canceled" />
            <Button type="submit" variant="destructive" size="sm">
              주문 취소
            </Button>
          </form>
        )}

      {/* 진행 이력 타임라인 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">진행 이력</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {history?.map((entry) => (
              <li key={entry.id} className="flex gap-3 text-sm">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="font-medium">
                    {ORDER_STATUS_LABEL[entry.to_status]}
                    <span className="ml-2 font-normal text-muted-foreground">
                      {formatDateTime(entry.created_at)}
                    </span>
                  </p>
                  <p className="text-muted-foreground">
                    {entry.profiles?.name ?? "고객"}
                    {entry.note ? ` — ${entry.note}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
