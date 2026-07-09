"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createQuote, type QuoteInput } from "@/server/actions/quotes";
import { formatKRW } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ProductOption = { id: string; name: string; model_code: string | null; price: number };
type CustomerOption = { id: string; name: string; company_name: string | null };

type ItemRow = {
  productId: string | null;
  itemName: string;
  unitPrice: number;
  qty: number;
};

const NEW_CUSTOMER = "__new__";
const CUSTOM_ITEM = "__custom__";

export function QuoteForm({
  products,
  customers,
}: {
  products: ProductOption[];
  customers: CustomerOption[];
}) {
  const [isPending, startTransition] = useTransition();
  const [customerId, setCustomerId] = useState<string>(NEW_CUSTOMER);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    companyName: "",
  });
  const [items, setItems] = useState<ItemRow[]>([
    { productId: null, itemName: "", unitPrice: 0, qty: 1 },
  ]);
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("");

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  const vat = Math.round(subtotal * 0.1);

  function updateItem(index: number, patch: Partial<ItemRow>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function selectProduct(index: number, value: string) {
    if (value === CUSTOM_ITEM) {
      updateItem(index, { productId: null });
      return;
    }
    const product = products.find((p) => p.id === value);
    if (product) {
      updateItem(index, {
        productId: product.id,
        itemName: product.name,
        unitPrice: product.price,
      });
    }
  }

  function submit() {
    const input: QuoteInput = {
      customerId: customerId === NEW_CUSTOMER ? null : customerId,
      newCustomer: customerId === NEW_CUSTOMER ? newCustomer : null,
      items: items.filter((item) => item.itemName.trim()),
      validUntil,
      notes,
    };
    if (!input.items.length) {
      toast.error("품목을 1개 이상 입력해주세요.");
      return;
    }
    if (customerId === NEW_CUSTOMER && !newCustomer.name.trim()) {
      toast.error("고객명을 입력해주세요.");
      return;
    }
    startTransition(async () => {
      try {
        await createQuote(input);
      } catch (e) {
        // redirect()가 던지는 예외는 Next가 처리하므로 그 외만 표시
        if (e instanceof Error && !e.message.includes("NEXT_REDIRECT")) {
          toast.error(e.message);
        } else {
          throw e;
        }
      }
    });
  }

  return (
    <div className="max-w-3xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">고객 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select
            value={customerId}
            onValueChange={(value) => setCustomerId(value ?? NEW_CUSTOMER)}
          >
            <SelectTrigger className="w-full sm:w-72">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NEW_CUSTOMER}>+ 신규 고객 입력</SelectItem>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                  {customer.company_name ? ` (${customer.company_name})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {customerId === NEW_CUSTOMER && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>고객명 *</Label>
                <Input
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder="홍길동"
                />
              </div>
              <div className="space-y-1.5">
                <Label>연락처</Label>
                <Input
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  placeholder="010-0000-0000"
                />
              </div>
              <div className="space-y-1.5">
                <Label>이메일 (견적 링크 발송용)</Label>
                <Input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>회사/상호</Label>
                <Input
                  value={newCustomer.companyName}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, companyName: e.target.value })
                  }
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">견적 품목</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-[1fr_auto] items-end gap-2 rounded-md border p-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1.5fr)_110px_70px_auto]"
            >
              <div className="space-y-1.5 sm:col-span-1">
                <Label className="text-xs">제품 선택</Label>
                <Select
                  value={item.productId ?? CUSTOM_ITEM}
                  onValueChange={(value) => selectProduct(index, value ?? CUSTOM_ITEM)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CUSTOM_ITEM}>직접 입력</SelectItem>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5 sm:col-span-1">
                <Label className="text-xs">품목명</Label>
                <Input
                  value={item.itemName}
                  onChange={(e) => updateItem(index, { itemName: e.target.value })}
                  placeholder="품목명"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">단가 (원)</Label>
                <Input
                  type="number"
                  min={0}
                  value={item.unitPrice || ""}
                  onChange={(e) => updateItem(index, { unitPrice: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">수량</Label>
                <Input
                  type="number"
                  min={1}
                  value={item.qty}
                  onChange={(e) =>
                    updateItem(index, { qty: Math.max(1, Number(e.target.value)) })
                  }
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                disabled={items.length === 1}
                aria-label="품목 삭제"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setItems((prev) => [
                ...prev,
                { productId: null, itemName: "", unitPrice: 0, qty: 1 },
              ])
            }
          >
            <Plus className="size-4" />
            품목 추가
          </Button>

          <div className="space-y-1 rounded-md bg-muted/50 p-3 text-right text-sm">
            <p>공급가액: {formatKRW(subtotal)}</p>
            <p>부가세(10%): {formatKRW(vat)}</p>
            <p className="text-base font-bold">합계: {formatKRW(subtotal + vat)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>견적 유효기간</Label>
            <Input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>비고 / 특약사항</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
        </CardContent>
      </Card>

      <Button onClick={submit} disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "저장 중..." : "견적서 저장"}
      </Button>
    </div>
  );
}
