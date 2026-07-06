import Link from "next/link";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-4 text-center">
      <Package className="size-12 text-primary" />
      <div>
        <h1 className="text-3xl font-bold">수산 회전링크</h1>
        <p className="mt-2 text-muted-foreground">
          회전링크 제품 소개와 판매·장착 통합 관리 시스템
        </p>
      </div>
      <div className="flex gap-3">
        <Button nativeButton={false} render={<Link href="/products" />}>
          제품 보기
        </Button>
        <Button
          nativeButton={false}
          variant="outline"
          render={<Link href="/login" />}
        >
          로그인
        </Button>
      </div>
    </main>
  );
}
