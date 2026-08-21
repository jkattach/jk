const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

type EventType =
  | 'auction_open'
  | 'bid_received'
  | 'auction_closing_soon'
  | 'bid_won'
  | 'matching_queue'

interface TelegramPayload {
  event: EventType
  chatId: string
  data: Record<string, string | number>
}

const TEMPLATES: Record<EventType, (d: Record<string, string | number>) => string> = {
  auction_open: (d) =>
    `🔔 새 경매 오픈\n상품: ${d.product}\n지역: ${d.region}\n마감: ${d.expiresAt}`,
  bid_received: (d) =>
    `💬 입찰 도착\n상품: ${d.product}\n입찰가: ${Number(d.price).toLocaleString()}원`,
  auction_closing_soon: (d) =>
    `⏰ 경매 마감 1시간 전\n상품: ${d.product}\n현재 입찰 수: ${d.bidCount}건`,
  bid_won: (d) =>
    `🎉 낙찰 확정\n상품: ${d.product}\n금액: ${Number(d.price).toLocaleString()}원`,
  matching_queue: (d) =>
    `📋 매칭 큐 도착\n경매 ID: ${d.auctionId}\n지역: ${d.region}`,
}

export async function sendTelegramMessage(payload: TelegramPayload): Promise<void> {
  if (!BOT_TOKEN) return

  const text = TEMPLATES[payload.event](payload.data)

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: payload.chatId, text, parse_mode: 'HTML' }),
  })
}
