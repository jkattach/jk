import { createClient } from "@/lib/supabase/server";
import { updateUser } from "@/server/actions/admin";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const metadata = { title: "회원 관리" };

const ROLE_LABEL = { admin: "관리자", seller: "판매자", installer: "장착자" } as const;
const STATUS_LABEL = { pending: "승인 대기", active: "활성", suspended: "정지" } as const;
const STATUS_VARIANT = {
  pending: "secondary",
  active: "default",
  suspended: "destructive",
} as const;

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: users, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <p className="text-destructive">회원 목록을 불러오지 못했습니다: {error.message}</p>;
  }

  const pendingCount = users.filter((u) => u.status === "pending").length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">회원 관리</h1>
        <p className="text-sm text-muted-foreground">
          전체 {users.length}명 · 승인 대기 {pendingCount}명
        </p>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>이메일</TableHead>
              <TableHead>소속</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>역할 / 상태 변경</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name || "—"}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.org_name || "—"}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[user.status]}>
                    {STATUS_LABEL[user.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <form action={updateUser} className="flex items-center gap-2">
                    <input type="hidden" name="userId" value={user.id} />
                    <Select name="role" defaultValue={user.role}>
                      <SelectTrigger size="sm" className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ROLE_LABEL).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select name="status" defaultValue={user.status}>
                      <SelectTrigger size="sm" className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_LABEL).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="submit" size="sm" variant="outline">
                      저장
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
