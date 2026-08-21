import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function AttachmentDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: item } = await supabase
    .from('attachments')
    .select('*, categories(name), compatibility(*)')
    .eq('id', params.id)
    .single()

  if (!item) notFound()

  type Compat = { ton_min: number; ton_max: number; note?: string }
  type ItemWithRelations = typeof item & { compatibility: Compat[]; categories: { name: string } }
  const itemData = item as ItemWithRelations
  const compatibility: Compat[] = (itemData.compatibility as Compat[]) ?? []

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/catalog/attachment" className="text-sm text-gray-500 hover:text-gray-900">← 카탈로그</Link>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-4">
          <div className="text-xs text-gray-400 mb-1">{itemData.categories?.name}</div>
          <h1 className="text-xl font-bold text-gray-900">{item.display_name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{item.brand} · {item.model_code}</p>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-500 mb-1">정가</div>
            {item.list_price ? (
              <div className="text-2xl font-bold text-gray-900">
                {item.list_price.toLocaleString()}원
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="bg-amber-50 text-amber-700 border border-amber-200 text-sm px-3 py-1 rounded-lg">
                  문의가 — 견적 요청 후 대리점 입찰가 확인
                </span>
              </div>
            )}
          </div>

          {compatibility?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-sm font-medium text-gray-700 mb-2">호환 톤급</div>
              <div className="flex flex-wrap gap-2">
                {compatibility.map((c, i) => (
                  <span key={i} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-lg">
                    {c.ton_min}–{c.ton_max}톤{c.note ? ` (${c.note})` : ''}
                  </span>
                ))}
              </div>
            </div>
          )}

          {Object.keys((item.spec_json as Record<string, string>) ?? {}).length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-sm font-medium text-gray-700 mb-2">사양</div>
              <dl className="space-y-1.5">
                {Object.entries(item.spec_json as Record<string, string>).map(([k, v]) => (
                  <div key={k} className="grid grid-cols-2 text-sm">
                    <dt className="text-gray-500">{k}</dt>
                    <dd className="text-gray-900">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <Link
              href={`/quote/new?attachment_id=${item.id}`}
              className="flex-1 bg-gray-900 text-white text-center rounded-xl py-3 text-sm font-semibold hover:bg-gray-700 transition-colors"
            >
              이 제품으로 견적 요청
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
