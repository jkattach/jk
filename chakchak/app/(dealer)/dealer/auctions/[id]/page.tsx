import { requireAuth } from '@/lib/auth/rbac'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BidForm from './BidForm'

export default async function DealerBidPage({ params }: { params: { id: string } }) {
  const { user } = await requireAuth(['dealer'])
  const supabase = createClient()

  const { data: quote } = await supabase
    .from('quote_requests')
    .select('*, attachments(display_name, model_code, list_price, spec_json, compatibility(*))')
    .eq('id', params.id)
    .eq('status', 'open')
    .single()

  if (!quote) notFound()

  const { data: existingBid } = await supabase
    .from('quote_bids')
    .select('id')
    .eq('request_id', params.id)
    .eq('bidder_id', user.id)
    .maybeSingle()

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-2">묶음 입찰</h1>
        <p className="text-sm text-gray-500 mb-6">본체 + 장착비를 합산한 금액으로 입찰하세요.</p>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
          <div className="font-semibold text-gray-900">
            {(quote.attachments as { display_name: string })?.display_name}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {quote.region_sido} {quote.region_sigungu ?? ''} · 경매 {quote.auction_hours}시간
          </div>
          <div className="mt-2 text-xs text-gray-400">
            마감: {new Date(quote.expires_at).toLocaleString('ko-KR')}
          </div>
          {quote.notes && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
              {quote.notes}
            </div>
          )}
        </div>

        {existingBid ? (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
            이미 입찰한 견적입니다.
          </div>
        ) : (
          <BidForm requestId={params.id} bidderId={user.id} />
        )}
      </div>
    </main>
  )
}
