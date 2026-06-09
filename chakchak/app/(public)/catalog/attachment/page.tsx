import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function CatalogPage() {
  const supabase = createClient()

  const { data: attachments } = await supabase
    .from('attachments')
    .select('id, brand, model_code, display_name, list_price, spec_json, categories(name)')
    .eq('status', 'active')
    .order('created_at', { ascending: true })

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-6">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">← 홈</Link>
          <h1 className="text-xl font-bold text-gray-900 mt-2">어태치먼트 카탈로그</h1>
          <p className="text-sm text-gray-500">총 {attachments?.length ?? 0}종</p>
        </div>

        {!attachments?.length ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
            등록된 어태치먼트가 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {attachments.map(item => (
              <Link
                key={item.id}
                href={`/catalog/attachment/${item.id}`}
                className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">
                      {(Array.isArray(item.categories) ? item.categories[0]?.name : (item.categories as unknown as { name: string })?.name)}
                    </div>
                    <div className="font-semibold text-gray-900">{item.display_name}</div>
                    <div className="text-xs text-gray-500">{item.brand} · {item.model_code}</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  {item.list_price ? (
                    <span className="text-base font-bold text-gray-900">
                      {item.list_price.toLocaleString()}원
                    </span>
                  ) : (
                    <span className="inline-block bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-lg">
                      문의가
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
