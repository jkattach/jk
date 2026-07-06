import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatKRW, productImageUrl } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  const images = [...product.product_images].sort(
    (a, b) => a.sort_order - b.sort_order
  );
  const specs =
    product.specs && typeof product.specs === "object" && !Array.isArray(product.specs)
      ? Object.entries(product.specs as Record<string, string>)
      : [];

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 p-4 md:p-8">
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        render={<Link href="/products" />}
        className="mb-4"
      >
        <ArrowLeft className="size-4" />
        제품 목록
      </Button>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
            {images[0] ? (
              <Image
                src={productImageUrl(images[0].storage_path)}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <Package className="size-12" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.slice(1).map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-square overflow-hidden rounded-md bg-muted"
                >
                  <Image
                    src={productImageUrl(img.storage_path)}
                    alt={product.name}
                    fill
                    sizes="25vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            {product.model_code && (
              <p className="text-sm text-muted-foreground">{product.model_code}</p>
            )}
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="mt-2 text-2xl font-bold text-primary">
              {formatKRW(product.price)}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                (VAT 별도)
              </span>
            </p>
          </div>

          {product.description && (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {product.description}
            </p>
          )}

          {specs.length > 0 && (
            <div>
              <h2 className="mb-2 font-semibold">제품 사양</h2>
              <div className="rounded-md border">
                <Table>
                  <TableBody>
                    {specs.map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell className="w-32 bg-muted/50 font-medium">
                          {key}
                        </TableCell>
                        <TableCell>{String(value)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            구매 상담은 가까운 대리점 또는 수산 본사로 문의해주세요. 견적은
            담당 판매자가 링크로 보내드립니다.
          </p>
        </div>
      </div>
    </main>
  );
}
