"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CopyLinkButton({ url }: { url: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={async () => {
        await navigator.clipboard.writeText(url);
        toast.success("견적서 링크가 복사되었습니다.");
      }}
    >
      <Copy className="size-4" />
      링크 복사
    </Button>
  );
}
