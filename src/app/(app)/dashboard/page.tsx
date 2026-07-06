import { requireActiveUser } from "@/lib/auth";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "대시보드" };

const ROLE_LABEL = {
  admin: "관리자",
  seller: "판매자",
  installer: "장착자",
} as const;

export default async function DashboardPage() {
  const profile = await requireActiveUser();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">대시보드</h1>
      <Card>
        <CardHeader>
          <CardTitle>
            {profile.name || profile.email}님, 안녕하세요
          </CardTitle>
          <CardDescription>
            역할: {ROLE_LABEL[profile.role]} — 판매 현황 요약은 견적·주문 기능과 함께 제공됩니다.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
