import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="space-y-4">
      <nav className="flex gap-1 border-b pb-2 text-sm">
        <Link
          href="/admin/users"
          className="rounded-md px-3 py-1.5 hover:bg-accent hover:text-accent-foreground"
        >
          회원 관리
        </Link>
        <Link
          href="/admin/products"
          className="rounded-md px-3 py-1.5 hover:bg-accent hover:text-accent-foreground"
        >
          제품 관리
        </Link>
      </nav>
      {children}
    </div>
  );
}
