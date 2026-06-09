import { requireAuth } from '@/lib/auth/rbac'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const FEE_RATE_B = parseFloat(process.env.PLATFORM_FEE_TRACK_B ?? '0.05')

export default async function InstallerAuctionsPage() {
  await requireAuth(['installer'])
  const supabase = createClient()

  const { data: auctions } = await supabase
    .from('install_auctions')
    .select('*, attachments(display_name)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">장착경매 목록</h1>

        {!auctions?.length ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
            현재 오픈된 장착경매가 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {auctions.map(a => {
              const feeAmt = Math.floor(a.consumer_price * FEE_RATE_B)
              const net = a.consumer_price - feeAmt
              return (
                <Link
                  key={a.id}
                  href={`/installer/auctions/${a.id}`}
                  className="block bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {(a.attachments as { display_name: string })?.display_name}
                      </div>
                      <div className="text-sm text-gray-500 mt-0.5">
                        {a.region_sido} {a.region_sigungu ?? ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">{net.toLocaleString()}원</div>
                      <div className="text-xs text-gray-400">수수료 5% 차감 후 수령</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    마감: {new Date(a.expires_at).toLocaleString('ko-KR')}
                    {' · '}
                    {a.stage === 'pool' ? '추천 우선' : '전체 공개'}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
