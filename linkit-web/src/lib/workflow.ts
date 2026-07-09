import type { Database } from "@/types/database";

export type OrderStatus = Database["public"]["Enums"]["order_status"];

// UI 렌더링용 전이 맵 — 진실의 원천은 DB의 advance_order_status() (이 맵은 미러)
export type Transition = {
  next: OrderStatus;
  label: string;
  actor: "admin" | "installer";
  requiredFields: ("ship_date" | "install_date" | "installer_id" | "install_location")[];
  description: string;
};

export const ORDER_TRANSITIONS: Partial<Record<OrderStatus, Transition[]>> = {
  purchase_confirmed: [
    {
      next: "approved",
      label: "본사 승인",
      actor: "admin",
      requiredFields: [],
      description: "수산 관리자가 판매 건을 승인합니다.",
    },
  ],
  approved: [
    {
      next: "shipping_scheduled",
      label: "출하 일정 확정",
      actor: "admin",
      requiredFields: ["ship_date"],
      description: "출하 예정일을 지정합니다.",
    },
  ],
  shipping_scheduled: [
    {
      next: "install_scheduled",
      label: "장착 일정·작업자 확정",
      actor: "admin",
      requiredFields: ["install_date", "installer_id", "install_location"],
      description: "장착일, 장착 장소, 담당 장착자를 지정하면 판매자·장착자에게 알림이 발송됩니다.",
    },
  ],
  install_scheduled: [
    {
      next: "installed",
      label: "장착 완료",
      actor: "installer",
      requiredFields: [],
      description: "장착이 끝나면 완료 처리해주세요.",
    },
  ],
  installed: [
    {
      next: "docs_delivered",
      label: "구조변경 서류 전달 완료",
      actor: "admin",
      requiredFields: [],
      description: "구조변경 서류를 전달했으면 완료 처리합니다.",
    },
  ],
};

export const ORDER_FLOW: OrderStatus[] = [
  "purchase_confirmed",
  "approved",
  "shipping_scheduled",
  "install_scheduled",
  "installed",
  "docs_delivered",
];
