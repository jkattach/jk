import { saveProduct } from "@/server/actions/products";
import { specsToText } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Tables } from "@/types/database";

// 서버 컴포넌트용 제품 등록/수정 폼 (server action 제출)
export function ProductForm({ product }: { product?: Tables<"products"> }) {
  return (
    <form action={saveProduct} className="max-w-xl space-y-4">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="space-y-1.5">
        <Label htmlFor="name">제품명 *</Label>
        <Input id="name" name="name" defaultValue={product?.name} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="model_code">모델 코드</Label>
          <Input
            id="model_code"
            name="model_code"
            defaultValue={product?.model_code ?? ""}
            placeholder="RL-200"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="price">가격 (원, VAT 별도) *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min={0}
            step={1000}
            defaultValue={product?.price ?? ""}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">제품 설명</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={product?.description ?? ""}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="specs">사양 (한 줄에 하나씩 &quot;항목: 값&quot;)</Label>
        <Textarea
          id="specs"
          name="specs"
          rows={6}
          defaultValue={specsToText(product?.specs)}
          placeholder={"허용하중: 5톤\n적용차종: 5톤 이상 카고트럭\n재질: SS400"}
        />
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={product ? product.is_active : true}
            className="size-4"
          />
          판매 중 (공개 페이지 노출)
        </label>
        <div className="flex items-center gap-2">
          <Label htmlFor="sort_order" className="text-sm">
            정렬 순서
          </Label>
          <Input
            id="sort_order"
            name="sort_order"
            type="number"
            defaultValue={product?.sort_order ?? 0}
            className="w-20"
          />
        </div>
      </div>

      <Button type="submit">{product ? "저장" : "제품 등록"}</Button>
    </form>
  );
}
