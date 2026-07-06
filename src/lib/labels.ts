import type { Database } from "@/types/database";

type QuoteStatus = Database["public"]["Enums"]["quote_status"];
type OrderStatus = Database["public"]["Enums"]["order_status"];

export const QUOTE_STATUS_LABEL: Record<QuoteStatus, string> = {
  draft: "작성 중",
  sent: "발송됨",
  viewed: "열람됨",
  confirmed: "구매 확정",
  expired: "기간 만료",
  canceled: "취소",
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  purchase_confirmed: "구매 확정",
  approved: "본사 승인",
  shipping_scheduled: "출하 일정 확정",
  install_scheduled: "장착 일정 확정",
  installed: "장착 완료",
  docs_delivered: "서류 전달 완료",
  canceled: "취소",
};

export const ROLE_LABEL: Record<Database["public"]["Enums"]["user_role"], string> = {
  admin: "관리자",
  seller: "판매자",
  installer: "장착자",
};
