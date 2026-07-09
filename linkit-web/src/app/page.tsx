import Link from "next/link";
import {
  ClipboardEdit,
  Gavel,
  CheckCircle2,
  Wrench,
  Coins,
  Megaphone,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "착착 — 중장비 어태치먼트, 연결하면 시장이 됩니다",
  description:
    "요청 1회로 여러 대리점의 경쟁 견적을 받는 순수 중개 플랫폼, 착착",
};

const PROBLEMS = [
  {
    icon: Coins,
    title: "가격 정보의 비대칭",
    body: "표준 정가가 없어, 대리점마다 개별 문의를 거쳐야 최저가를 알 수 있습니다.",
  },
  {
    icon: Megaphone,
    title: "고객 접점 채널의 부재",
    body: "대리점 영업은 지역 구전에 의존하며, 전국 단위 리드 확보 수단이 없습니다.",
  },
  {
    icon: Wrench,
    title: "설치 인력 수급의 불안정성",
    body: "표준화된 매칭 채널 없이 개별 섭외에 의존해 품질과 일정 편차가 발생합니다.",
  },
];

const STEPS = [
  {
    icon: ClipboardEdit,
    no: "01",
    title: "요청 등록",
    body: "원하는 품목, 지역, 조건을 입력합니다. 회원가입이 필요 없습니다.",
  },
  {
    icon: Gavel,
    no: "02",
    title: "경쟁 견적",
    body: "여러 대리점이 경쟁 가격을 제시합니다.",
  },
  {
    icon: CheckCircle2,
    no: "03",
    title: "선택 확정",
    body: "조건을 비교해 최적의 견적을 직접 선택합니다.",
  },
  {
    icon: Wrench,
    no: "04",
    title: "장착까지",
    body: "선택한 대리점이 연락해 장착 일정까지 진행합니다.",
  },
];

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="mx-auto w-full max-w-5xl px-4 py-20 text-center md:py-28">
        <p className="text-xs font-semibold tracking-[0.2em] text-primary">
          NEW BUSINESS PLAN 2026
        </p>
        <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
          중장비 어태치먼트,
          <br />
          <span className="text-primary">연결하면 시장이 됩니다</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          정보 비대칭을 없애는 순수 중개 플랫폼 <strong>착착</strong>. 요청
          1회로 여러 대리점의 경쟁 견적을 받고, 직접 비교해 선택하세요.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" nativeButton={false} render={<Link href="/request" />}>
            무료 견적 요청하기
          </Button>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link href="/products" />}
          >
            제품 보기
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          대리점이신가요?{" "}
          <Link href="/login" className="underline underline-offset-4">
            딜러 로그인 / 입점 신청
          </Link>
        </p>
      </section>

      {/* Problem */}
      <section className="border-t bg-muted/40">
        <div className="mx-auto w-full max-w-5xl px-4 py-16">
          <p className="text-xs font-semibold tracking-[0.2em] text-primary">
            PROBLEM
          </p>
          <h2 className="mt-2 text-2xl font-bold md:text-3xl">
            여전히, 아날로그로 움직이는 시장
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {PROBLEMS.map((problem) => (
              <Card key={problem.title}>
                <CardContent className="pt-6">
                  <problem.icon className="size-8 text-primary" />
                  <h3 className="mt-3 font-semibold">{problem.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {problem.body}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t">
        <div className="mx-auto w-full max-w-5xl px-4 py-16">
          <p className="text-xs font-semibold tracking-[0.2em] text-primary">
            HOW IT WORKS
          </p>
          <h2 className="mt-2 text-2xl font-bold md:text-3xl">
            요청 1회, 경쟁 견적, 소비자 선택
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <Card key={step.no}>
                <CardContent className="pt-6">
                  <p className="text-xs font-bold tracking-widest text-primary">
                    {step.no}
                  </p>
                  <step.icon className="mt-2 size-7 text-primary" />
                  <h3 className="mt-3 font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {step.body}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 rounded-xl border bg-muted/40 p-6 text-center">
            <p className="font-medium">착착은 돈을 만지지 않습니다</p>
            <p className="mt-1 text-sm text-muted-foreground">
              거래를 연결할 뿐, 대금을 예치하거나 대신 받지 않는 순수 중개
              구조입니다. 결제는 당사자 간에 직접 이뤄집니다.
            </p>
          </div>
        </div>
      </section>

      {/* Value */}
      <section className="border-t bg-muted/40">
        <div className="mx-auto w-full max-w-5xl px-4 py-16 text-center">
          <Users className="mx-auto size-8 text-primary" />
          <h2 className="mt-3 text-2xl font-bold md:text-3xl">
            모두가 이득을 얻는 구조
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
            소비자는 비교하고 선택하고, 판매자는 전국 단위 고객을 얻고, 설치
            인력은 공정하게 배정받습니다.
          </p>
          <div className="mt-8">
            <Button size="lg" nativeButton={false} render={<Link href="/request" />}>
              지금 견적 요청하기
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        착착 · 연결하면, 시장이 됩니다
      </footer>
    </main>
  );
}
