import { formatKRW, formatDate } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type QuoteViewData = {
  quote_no: string;
  created_at: string;
  valid_until: string | null;
  subtotal: number;
  vat: number;
  total: number;
  notes: string | null;
  customer_snapshot: Record<string, string>;
  seller: { name: string; org_name: string | null; phone: string | null };
  items: { id: string; item_name: string; unit_price: number; qty: number; amount: number }[];
};

// 견적서 본문 (화면·인쇄·공개 페이지 공용)
export function QuoteView({ data }: { data: QuoteViewData }) {
  const { customer_snapshot: customer, seller } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">견 적 서</h2>
          <p className="text-sm text-muted-foreground">{data.quote_no}</p>
        </div>
        <div className="text-right text-sm">
          <p>작성일: {formatDate(data.created_at)}</p>
          {data.valid_until && <p>유효기간: {formatDate(data.valid_until)}까지</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
        <div className="rounded-md border p-3">
          <p className="mb-1 font-semibold">받는 분</p>
          <p>{customer?.name ?? "—"}</p>
          {customer?.company_name && <p>{customer.company_name}</p>}
          {customer?.phone && <p>{customer.phone}</p>}
        </div>
        <div className="rounded-md border p-3">
          <p className="mb-1 font-semibold">공급자</p>
          <p>수산 회전링크</p>
          <p>
            담당: {seller?.name}
            {seller?.org_name ? ` (${seller.org_name})` : ""}
          </p>
          {seller?.phone && <p>{seller.phone}</p>}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>품목</TableHead>
              <TableHead className="text-right">단가</TableHead>
              <TableHead className="text-right">수량</TableHead>
              <TableHead className="text-right">금액</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.item_name}</TableCell>
                <TableCell className="text-right">{formatKRW(item.unit_price)}</TableCell>
                <TableCell className="text-right">{item.qty}</TableCell>
                <TableCell className="text-right">{formatKRW(item.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-1 text-right text-sm">
        <p>공급가액: {formatKRW(data.subtotal)}</p>
        <p>부가세: {formatKRW(data.vat)}</p>
        <p className="text-lg font-bold">합계금액: {formatKRW(data.total)}</p>
      </div>

      {data.notes && (
        <div className="rounded-md border p-3 text-sm">
          <p className="mb-1 font-semibold">비고</p>
          <p className="whitespace-pre-wrap">{data.notes}</p>
        </div>
      )}
    </div>
  );
}
