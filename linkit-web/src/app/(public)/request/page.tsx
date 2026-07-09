import Link from "next/link";
import { Handshake } from "lucide-react";
import { createRequest } from "@/server/actions/requests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "견적 요청 — 착착" };

export default function RequestPage() {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 space-y-6 p-4 md:p-8">
      <div className="text-center">
        <Handshake className="mx-auto size-10 text-primary" />
        <h1 className="mt-3 text-2xl font-bold">견적 요청하기</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          요청 1회로 여러 대리점의 경쟁 견적을 받아보세요. 회원가입이 필요
          없으며, 연락처는 선택한 대리점에게만 공개됩니다.
        </p>
      </div>

      <form action={createRequest}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">요청 내용</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="itemName">원하는 품목 *</Label>
              <Input
                id="itemName"
                name="itemName"
                required
                maxLength={100}
                placeholder="예: 회전링크 (틸트로테이터)"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="region">지역 *</Label>
                <Input
                  id="region"
                  name="region"
                  required
                  maxLength={100}
                  placeholder="예: 경기 화성"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="excavatorModel">굴삭기 모델</Label>
                <Input
                  id="excavatorModel"
                  name="excavatorModel"
                  maxLength={100}
                  placeholder="예: DX55, R30Z-9 등"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="desiredDate">희망 장착일</Label>
              <Input id="desiredDate" name="desiredDate" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="details">상세 요청 사항</Label>
              <Textarea
                id="details"
                name="details"
                maxLength={2000}
                rows={4}
                placeholder="장비 상태, 작업 환경, 예산 등 대리점이 알아야 할 내용을 적어주세요."
              />
            </div>

            <div className="border-t pt-4">
              <p className="mb-3 text-sm font-medium">
                연락처 (선택한 대리점에게만 공개)
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">이름 *</Label>
                  <Input id="name" name="name" required maxLength={50} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">휴대폰 번호 *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    required
                    maxLength={30}
                    placeholder="010-0000-0000"
                  />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Label htmlFor="email">이메일 (새 견적 도착 알림용)</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  maxLength={200}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full">
              견적 요청 등록하기
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              등록하면 내 요청 페이지 링크가 발급됩니다. 링크를 저장해두세요.
            </p>
          </CardContent>
        </Card>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        대리점이신가요?{" "}
        <Link href="/login" className="underline underline-offset-4">
          딜러 로그인
        </Link>
      </p>
    </main>
  );
}
