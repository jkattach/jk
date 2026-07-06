import Link from "next/link";
import {
  signInWithOAuth,
  signInWithPassword,
  signUpWithPassword,
} from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const metadata = { title: "로그인" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">수산 회전링크</CardTitle>
          <CardDescription>판매 관리 시스템 로그인</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {error === "auth" ? "로그인에 실패했습니다. 다시 시도해주세요." : error}
              </AlertDescription>
            </Alert>
          )}

          <form action={signInWithOAuth.bind(null, "kakao")}>
            <Button
              type="submit"
              className="w-full bg-[#FEE500] text-[#191919] hover:bg-[#FEE500]/90"
            >
              카카오로 시작하기
            </Button>
          </form>
          <form action={signInWithOAuth.bind(null, "google")}>
            <Button type="submit" variant="outline" className="w-full">
              구글로 시작하기
            </Button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs text-muted-foreground">
              <span className="bg-card px-2">또는 이메일로</span>
            </div>
          </div>

          <Tabs defaultValue="signin">
            <TabsList className="w-full">
              <TabsTrigger value="signin" className="flex-1">
                로그인
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">
                회원가입
              </TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form action={signInWithPassword} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="email">이메일</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">비밀번호</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
                <Button type="submit" variant="secondary" className="w-full">
                  이메일로 로그인
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form action={signUpWithPassword} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="su-name">이름</Label>
                  <Input id="su-name" name="name" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="su-email">이메일</Label>
                  <Input id="su-email" name="email" type="email" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="su-password">비밀번호 (6자 이상)</Label>
                  <Input
                    id="su-password"
                    name="password"
                    type="password"
                    minLength={6}
                    required
                  />
                </div>
                <Button type="submit" variant="secondary" className="w-full">
                  가입 신청
                </Button>
                <p className="text-xs text-muted-foreground">
                  가입 후 관리자 승인이 완료되면 이용할 수 있습니다.
                </p>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-center text-xs text-muted-foreground">
            <Link href="/" className="underline">
              제품 소개 보기
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
