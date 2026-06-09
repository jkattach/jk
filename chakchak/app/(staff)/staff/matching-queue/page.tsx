import { requireAuth } from '@/lib/auth/rbac'
import { createClient } from '@/lib/supabase/server'

export default async function MatchingQueuePage() {
  await requireAuth(['internal_staff', 'admin'])
  const supabase = createClient()

  const { data: queue } = await supabase
    .from('install_auctions')
    .select('*, attachments(display_name)')
    .eq('status', 'open')
    .order('expires_at', { ascending: true })

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-2">매칭 큐</h1>
        <p className="text-sm text-gray-500 mb-6">
          가중치 알고리즘: 지역 40% · 평점 30% · 응답속도 20% · 가격 10%
        </p>

        {!queue?.length ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
            매칭 대기 중인 경매가 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {queue.map(a => (
              <div key={a.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {(a.attachments as { display_name: string })?.display_name}
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {a.region_sido} {a.region_sigungu ?? ''} · 풀: {a.stage}
                    </div>
                  </div>
                  <span className="bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-lg border border-amber-200">
                    매칭 대기
                  </span>
                </div>
                <div className="mt-3 text-xs text-gray-400">
                  마감: {new Date(a.expires_at).toLocaleString('ko-KR')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
