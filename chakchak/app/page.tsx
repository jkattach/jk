import Link from 'next/link'

const CATEGORIES = [
  { icon: '🔨', name: '브레이커', desc: '암반·콘크리트 파쇄' },
  { icon: '✂️', name: '크러셔', desc: '건물 해체·절단' },
  { icon: '🪣', name: '버킷', desc: '굴착·운반 범용' },
  { icon: '🦅', name: '그래플', desc: '폐기물·목재 집게' },
  { icon: '🔗', name: '퀵커플러', desc: '어태치 빠른 교체' },
  { icon: '🧲', name: '마그넷', desc: '금속 자재 자동 분류' },
  { icon: '🔲', name: '컴팩터', desc: '지반 다짐' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gray-900 text-white rounded-xl flex items-center justify-center font-bold text-sm">
              착착
            </div>
            <span className="font-semibold text-gray-900 hidden sm:block">착착</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/catalog/attachment"
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5"
            >
              카탈로그
            </Link>
            <Link
              href="/login"
              className="text-sm bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors"
            >
              로그인
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gray-900 text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-6">
            <span>중장비 어태치먼트</span>
            <span className="text-white/50">·</span>
            <span>역경매 플랫폼</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            어태치먼트를<br />가장 빠르게, 가장 합리적으로
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">
            견적 요청 한 번으로 여러 대리점이 경쟁 입찰. 최저가를 직접 선택하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/quote/new"
              className="bg-white text-gray-900 rounded-xl px-6 py-3.5 font-semibold hover:bg-gray-100 transition-colors"
            >
              지금 견적 요청하기 →
            </Link>
            <Link
              href="/catalog/attachment"
              className="border border-white/20 text-white rounded-xl px-6 py-3.5 font-semibold hover:bg-white/10 transition-colors"
            >
              카탈로그 보기
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-xl font-bold text-center text-gray-900 mb-10">착착은 어떻게 작동하나요?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {[
              { step: '1', title: '어태치먼트 선택', desc: '원하는 제품과 사양을 선택하세요' },
              { step: '2', title: '견적 요청', desc: '지역·옵션·경매 시간을 설정합니다' },
              { step: '3', title: '입찰 대기', desc: '대리점들이 실시간으로 입찰합니다' },
              { step: '4', title: '최저가 선택', desc: '입찰 카드를 비교하고 확정하세요' },
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-3">
                  {item.step}
                </div>
                <div className="font-semibold text-gray-900 mb-1">{item.title}</div>
                <div className="text-sm text-gray-500">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category grid */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900">취급 어태치먼트</h3>
            <Link href="/catalog/attachment" className="text-sm text-gray-500 hover:text-gray-900">
              전체 보기 →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.name}
                href="/catalog/attachment"
                className="bg-gray-50 hover:bg-gray-100 rounded-2xl p-4 text-center transition-colors"
              >
                <div className="text-3xl mb-2">{cat.icon}</div>
                <div className="font-semibold text-sm text-gray-900">{cat.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{cat.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Partner CTA */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-xl font-bold mb-2">파트너로 참여하세요</h3>
          <p className="text-gray-400 text-sm mb-6">대리점·세미딜러·장착자 모두 환영합니다</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup/partner"
              className="bg-white text-gray-900 rounded-xl px-6 py-3 font-semibold text-sm hover:bg-gray-100 transition-colors"
            >
              파트너 가입 신청
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
