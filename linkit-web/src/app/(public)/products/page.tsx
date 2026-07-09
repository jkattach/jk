import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatKRW, productImageUrl } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "제품 소개" };

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("is_active", true)
    .order("sort_order")
    .order("created_at");

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">회전링크 제품</h1>
          <p className="text-sm text-muted-foreground">
            수산 회전링크 제품 사양과 가격을 확인하세요.
          </p>
        </div>
        <Button variant="outline" nativeButton={false} render={<Link href="/login" />}>
          로그인
        </Button>
      </div>

      {!products?.length ? (
        <div className="flex flex-col items-center gap-3 py-24 text-muted-foreground">
          <Package className="size-10" />
          등록된 제품이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const cover = [...product.product_images].sort(
              (a, b) => a.sort_order - b.sort_order
            )[0];
            return (
              <Link key={product.id} href={`/products/${product.id}`}>
                <Card className="h-full gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
                  <div className="relative aspect-[4/3] bg-muted">
                    {cover ? (
                      <Image
                        src={productImageUrl(cover.storage_path)}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <Package className="size-10" />
                      </div>
                    )}
                  </div>
                  <CardContent className="space-y-1 p-4">
                    <p className="text-xs text-muted-foreground">
                      {product.model_code || " "}
                    </p>
                    <h2 className="font-semibold">{product.name}</h2>
                    <p className="text-lg font-bold text-primary">
                      {formatKRW(product.price)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
