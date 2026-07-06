import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireActiveUser } from "@/lib/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "고객 관리" };

export default async function CustomersPage() {
  const profile = await requireActiveUser();
  const supabase = await createClient();

  const { data: customers } = await supabase
    .from("customers")
    .select("*, quotes(id), profiles!customers_owner_id_fkey(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">고객 관리</h1>
        <p className="text-sm text-muted-foreground">
          {profile.role === "admin"
            ? "전체 고객 목록입니다."
            : "내가 담당하는 고객입니다. 신규 고객은 견적 작성 시 등록됩니다."}
        </p>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>고객명</TableHead>
              <TableHead>회사/상호</TableHead>
              <TableHead>연락처</TableHead>
              <TableHead>견적 수</TableHead>
              {profile.role === "admin" && <TableHead>담당 판매자</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers?.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <Link
                    href={`/customers/${customer.id}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {customer.name}
                  </Link>
                </TableCell>
                <TableCell>{customer.company_name || "—"}</TableCell>
                <TableCell>{customer.phone || customer.email || "—"}</TableCell>
                <TableCell>{customer.quotes.length}건</TableCell>
                {profile.role === "admin" && (
                  <TableCell>{customer.profiles?.name ?? "—"}</TableCell>
                )}
              </TableRow>
            ))}
            {!customers?.length && (
              <TableRow>
                <TableCell
                  colSpan={profile.role === "admin" ? 5 : 4}
                  className="py-10 text-center text-muted-foreground"
                >
                  등록된 고객이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
