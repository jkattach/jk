"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { parseSpecsText } from "@/lib/format";

function revalidateProducts() {
  revalidatePath("/products");
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function saveProduct(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const values = {
    name: String(formData.get("name") ?? "").trim(),
    model_code: String(formData.get("model_code") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim() || null,
    specs: parseSpecsText(String(formData.get("specs") ?? "")),
    price: Number(formData.get("price") ?? 0),
    is_active: formData.get("is_active") === "on",
    sort_order: Number(formData.get("sort_order") ?? 0),
  };
  if (!values.name) throw new Error("제품명은 필수입니다.");
  if (!Number.isFinite(values.price) || values.price < 0) {
    throw new Error("가격이 올바르지 않습니다.");
  }

  if (id) {
    const { error } = await supabase.from("products").update(values).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await supabase
      .from("products")
      .insert(values)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    revalidateProducts();
    redirect(`/admin/products/${data.id}`);
  }

  revalidateProducts();
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");

  // 견적에서 참조 중일 수 있으므로 실제 삭제 대신 비활성화
  const { error } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidateProducts();
  redirect("/admin/products");
}

export async function uploadProductImage(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const productId = String(formData.get("productId") ?? "");
  const file = formData.get("file") as File | null;
  if (!productId || !file || file.size === 0) {
    throw new Error("이미지 파일을 선택해주세요.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("이미지는 5MB 이하만 업로드할 수 있습니다.");
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${productId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type || undefined });
  if (uploadError) throw new Error(uploadError.message);

  const { error } = await supabase.from("product_images").insert({
    product_id: productId,
    storage_path: path,
  });
  if (error) throw new Error(error.message);

  revalidateProducts();
  revalidatePath(`/admin/products/${productId}`);
}

export async function deleteProductImage(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const imageId = String(formData.get("imageId") ?? "");
  const { data: image, error: fetchError } = await supabase
    .from("product_images")
    .select("*")
    .eq("id", imageId)
    .single();
  if (fetchError) throw new Error(fetchError.message);

  await supabase.storage.from("product-images").remove([image.storage_path]);
  const { error } = await supabase.from("product_images").delete().eq("id", imageId);
  if (error) throw new Error(error.message);

  revalidateProducts();
  revalidatePath(`/admin/products/${image.product_id}`);
}
