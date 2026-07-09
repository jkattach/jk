import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { signOut } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "승인 대기" };

export default async function PendingPage() {
  const session = await getSessionProfile();
  if (!session) redirect("/login");
  if (session.profile.status === "active") redirect("/dashboard");

  const suspended = session.profile.status === "suspended";

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle>{suspended ? "이용 정지된 계정" : "관리자 승인 대기 중"}</CardTitle>
          <CardDescription>
            {suspended
              ? "계정 이용이 정지되었습니다. 관리자에게 문의해주세요."
              : "가입 신청이 접수되었습니다. 관리자가 승인하면 시스템을 이용할 수 있습니다."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signOut}>
            <Button type="submit" variant="outline" className="w-full">
              로그아웃
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
