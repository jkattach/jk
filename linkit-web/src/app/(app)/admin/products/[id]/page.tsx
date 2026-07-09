import Image from "next/image";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { productImageUrl } from "@/lib/format";
import {
  deleteProduct,
  deleteProductImage,
  uploadProductImage,
} from "@/server/actions/products";
import { ProductForm } from "@/components/product-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export const metadata = { title: "제품 수정" };

export default async function EditProductPage({
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
    .single();

  if (!product) notFound();

  const images = [...product.product_images].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">제품 수정</h1>
        <form action={deleteProduct}>
          <input type="hidden" name="id" value={product.id} />
          <Button type="submit" variant="destructive" size="sm">
            비활성화
          </Button>
        </form>
      </div>

      <ProductForm product={product} />

      <Separator />

      <div className="max-w-xl space-y-3">
        <h2 className="font-semibold">제품 사진 ({images.length}장)</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-square overflow-hidden rounded-md border bg-muted">
              <Image
                src={productImageUrl(img.storage_path)}
                alt=""
                fill
                sizes="(max-width: 640px) 33vw, 25vw"
                className="object-cover"
              />
              <form action={deleteProductImage} className="absolute top-1 right-1">
                <input type="hidden" name="imageId" value={img.id} />
                <Button
                  type="submit"
                  variant="destructive"
                  size="icon-xs"
                  aria-label="사진 삭제"
                >
                  <Trash2 className="size-3" />
                </Button>
              </form>
            </div>
          ))}
        </div>
        <form action={uploadProductImage} className="flex items-center gap-2">
          <input type="hidden" name="productId" value={product.id} />
          <Input type="file" name="file" accept="image/*" required className="max-w-xs" />
          <Button type="submit" variant="outline">
            사진 추가
          </Button>
        </form>
        <p className="text-xs text-muted-foreground">
          첫 번째 사진이 목록·상세의 대표 이미지로 사용됩니다. (5MB 이하)
        </p>
      </div>
    </div>
  );
}
