import { requireAuth } from '@/lib/auth/rbac'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DealerAuctionsPage() {
  await requireAuth(['dealer'])
  const supabase = createClient()

  const { data: openQuotes } = await supabase
    .from('quote_requests')
    .select('*, attachments(display_name, model_code), users!customer_id(display_name)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">오픈 경매 리스트</h1>

        {!openQuotes?.length ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
            현재 오픈된 경매가 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {openQuotes.map(q => (
              <Link
                key={q.id}
                href={`/dealer/auctions/${q.id}`}
                className="block bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {(q.attachments as { display_name: string })?.display_name}
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {q.region_sido} {q.region_sigungu ?? ''} · {q.auction_hours}시간
                    </div>
                  </div>
                  <span className="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-lg border border-green-200">
                    입찰 가능
                  </span>
                </div>
                <div className="mt-3 text-xs text-gray-400">
                  마감: {new Date(q.expires_at).toLocaleString('ko-KR')}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
