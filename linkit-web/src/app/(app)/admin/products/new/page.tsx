import { ProductForm } from "@/components/product-form";

export const metadata = { title: "제품 등록" };

export default function NewProductPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">제품 등록</h1>
      <ProductForm />
    </div>
  );
}
