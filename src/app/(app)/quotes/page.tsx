import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireActiveUser } from "@/lib/auth";
import { formatKRW, formatDate } from "@/lib/format";
import { QUOTE_STATUS_LABEL } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "견적 관리" };

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "secondary",
  sent: "outline",
  viewed: "outline",
  confirmed: "default",
  expired: "destructive",
  canceled: "destructive",
};

export default async function QuotesPage() {
  await requireActiveUser();
  const supabase = await createClient();
  const { data: quotes } = await supabase
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">견적 관리</h1>
        <Button nativeButton={false} render={<Link href="/quotes/new" />}>
          <Plus className="size-4" />
          견적 작성
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>견적번호</TableHead>
              <TableHead>고객</TableHead>
              <TableHead>금액(VAT포함)</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>작성일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes?.map((quote) => {
              const snapshot = quote.customer_snapshot as Record<string, string>;
              return (
                <TableRow key={quote.id}>
                  <TableCell>
                    <Link
                      href={`/quotes/${quote.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {quote.quote_no}
                    </Link>
                  </TableCell>
                  <TableCell>{snapshot?.name ?? "—"}</TableCell>
                  <TableCell>{formatKRW(quote.total)}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[quote.status] ?? "secondary"}>
                      {QUOTE_STATUS_LABEL[quote.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(quote.created_at)}</TableCell>
                </TableRow>
              );
            })}
            {!quotes?.length && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  견적이 없습니다. 첫 견적을 작성해보세요.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
