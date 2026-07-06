"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Package,
  Users,
  ClipboardList,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "@/server/actions/auth";
import type { Database } from "@/types/database";

type Role = Database["public"]["Enums"]["user_role"];

const NAV_ITEMS: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
}[] = [
  { href: "/dashboard", label: "대시보드", icon: LayoutDashboard, roles: ["admin", "seller", "installer"] },
  { href: "/quotes", label: "견적", icon: FileText, roles: ["admin", "seller"] },
  { href: "/orders", label: "판매/장착", icon: ClipboardList, roles: ["admin", "seller", "installer"] },
  { href: "/customers", label: "고객", icon: Users, roles: ["admin", "seller"] },
  { href: "/admin/users", label: "관리", icon: Settings, roles: ["admin"] },
];

export function AppShell({
  role,
  userName,
  children,
}: {
  role: Role;
  userName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <div className="flex min-h-svh w-full">
      {/* 데스크톱 사이드바 */}
      <aside className="hidden w-56 shrink-0 flex-col border-r bg-sidebar md:flex">
        <div className="flex h-14 items-center gap-2 border-b px-4 font-semibold">
          <Package className="size-5" />
          수산 회전링크
        </div>
        <nav className="flex-1 space-y-1 p-2">
          {items.map((item) => {
            const active = pathname.startsWith(item.href.split("/").slice(0, 2).join("/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-3">
          <p className="mb-2 truncate px-1 text-sm text-muted-foreground">{userName}</p>
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm" className="w-full justify-start">
              <LogOut className="size-4" />
              로그아웃
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* 모바일 상단바 */}
        <header className="flex h-14 items-center justify-between border-b px-4 md:hidden">
          <span className="flex items-center gap-2 font-semibold">
            <Package className="size-5" />
            수산 회전링크
          </span>
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="icon" aria-label="로그아웃">
              <LogOut className="size-4" />
            </Button>
          </form>
        </header>

        <main className="flex-1 p-4 pb-20 md:p-6 md:pb-6">{children}</main>

        {/* 모바일 하단 탭 */}
        <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t bg-background md:hidden">
          {items.map((item) => {
            const active = pathname.startsWith(item.href.split("/").slice(0, 2).join("/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px]",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
