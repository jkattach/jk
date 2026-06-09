import { requireAuth } from '@/lib/auth/rbac'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function SemiSalesPage() {
  const { user } = await requireAuth(['semi_dealer'])
  const supabase = createClient()

  const { data: auctions } = await supabase
    .from('install_auctions')
    .select('*, attachments(display_name, dealer_price)')
    .eq('semi_dealer_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">판매 관리</h1>
          <Link
            href="/semi/install-auctions/new"
            className="bg-gray-900 text-white text-sm px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors"
          >
            + 장착경매 발주
          </Link>
        </div>

        {!auctions?.length ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
            진행 중인 판매가 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {auctions.map(a => (
              <Link
                key={a.id}
                href={`/semi/install-auctions/${a.id}`}
                className="block bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {(a.attachments as { display_name: string })?.display_name}
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {a.region_sido} · 소비자가 {a.consumer_price.toLocaleString()}원
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-lg border ${
                    a.status === 'open'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-gray-100 text-gray-500 border-gray-200'
                  }`}>
                    {a.status === 'open' ? '진행 중' : a.status}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  풀: {a.stage === 'pool' ? '추천 장착자 대기' : '전체 공개'}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
