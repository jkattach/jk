import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ROLES = [
  {
    id: 'official',
    label: '정식 딜러',
    badge: '공식',
    icon: '🏢',
    desc: '계약 후 도매가로 제품을 직접 공급받아 판매하는 공식 파트너',
    perks: ['도매 공급가 적용', '전용 영업 지원', '제품 교육 제공', '월정산 수수료'],
    cta: '정식 딜러 신청',
    highlight: true,
  },
  {
    id: 'introducer',
    label: '세미딜러 (소개자)',
    badge: '세미',
    icon: '🤝',
    desc: '재고 없이 소개 링크로 거래를 연결하고 건당 수수료를 받는 파트너',
    perks: ['소개 링크 발급', '건당 수수료 지급', '계약 불필요', '앱에서 실적 조회'],
    cta: '세미딜러 등록',
    highlight: false,
  },
  {
    id: 'consumer',
    label: '소비자 회원',
    badge: '회원',
    icon: '👤',
    desc: '제품을 구매한 고객으로 주문 이력·A/S 접수를 간편하게 관리',
    perks: ['주문 이력 조회', 'A/S 간편 접수', '재구매 할인', '멤버십 적립'],
    cta: '내 주문 보기',
    highlight: false,
  },
]

const STATS = [
  { label: '누적 딜러', value: '320+', sub: '명' },
  { label: '월 거래액', value: '4.2억', sub: '원' },
  { label: '평균 수수료', value: '8', sub: '%' },
  { label: '정산 주기', value: '월 1회', sub: '' },
]

const PRODUCTS = [
  { name: '틸트로테이터', img: '🔩', desc: '360° 회전 + 틸트 기능' },
  { name: '회전링크', img: '⚙️', desc: '굴착기 어태치먼트 연결' },
  { name: '레벨기 세트', img: '📐', desc: '정밀 수평 작업 솔루션' },
  { name: '퀵커플러', img: '🔧', desc: '어태치먼트 신속 교체' },
]

const FAQ = [
  {
    q: '정식 딜러와 세미딜러의 차이는?',
    a: '정식 딜러는 계약 후 도매가로 재고를 구매·판매합니다. 세미딜러는 재고 없이 소개 링크로 거래를 연결하고 건당 수수료를 받습니다.',
  },
  {
    q: '수수료는 언제 지급되나요?',
    a: '매월 말일 기준으로 익월 10일 이내에 등록하신 계좌로 정산됩니다.',
  },
  {
    q: '신청 후 승인까지 얼마나 걸리나요?',
    a: '세미딜러는 즉시 승인, 정식 딜러는 서류 검토 후 영업일 3~5일 내 담당자가 연락드립니다.',
  },
  {
    q: 'A/S는 어떻게 접수하나요?',
    a: '앱 내 서비스접수 메뉴에서 간편하게 A/S를 신청할 수 있습니다. 현장 방문 또는 수거 방식 중 선택 가능합니다.',
  },
]

export default function SemiDealerLanding() {
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* 헤더 */}
      <header className="bg-brand-dark text-white py-3 px-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-brand-orange font-extrabold text-lg tracking-tight">틸로코리아</span>
          <span className="text-[10px] bg-brand-orange text-white font-bold px-2 py-0.5 rounded-full">딜러 파트너</span>
        </div>
        <button
          onClick={() => navigate('/semi-dealer/dashboard')}
          className="text-xs bg-brand-orange text-white font-bold px-4 py-1.5 rounded-full hover:bg-orange-600 transition"
        >
          내 대시보드
        </button>
      </header>

      {/* 히어로 */}
      <section className="bg-brand-dark text-white pt-14 pb-16 px-4 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 60%, #F97316 0%, transparent 45%), radial-gradient(circle at 85% 15%, #F59E0B 0%, transparent 40%)',
          }}
        />
        <div className="relative max-w-xl mx-auto text-center">
          <span className="inline-block text-[11px] font-bold bg-brand-orange/20 text-brand-orange border border-brand-orange/30 px-3 py-1 rounded-full mb-4 tracking-widest uppercase">
            Partner Program
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight">
            틸로코리아와 함께<br />
            <span className="text-brand-orange">수익을 만드세요</span>
          </h1>
          <p className="text-stone-300 text-sm sm:text-base mb-8 leading-relaxed">
            틸트로테이터 · 회전링크 · 레벨기 · 퀵커플러<br />
            내 방식대로 판매하고, 건당 수수료를 받으세요
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => navigate('/semi-dealer/apply?role=introducer')}
              className="bg-brand-orange text-white font-extrabold px-7 py-3 rounded-full text-sm hover:bg-orange-600 transition shadow-lg"
            >
              세미딜러 등록하기
            </button>
            <button
              onClick={() => document.getElementById('roles').scrollIntoView({ behavior: 'smooth' })}
              className="border border-white/30 text-white font-bold px-7 py-3 rounded-full text-sm hover:bg-white/10 transition"
            >
              유형 비교 보기
            </button>
          </div>
        </div>
      </section>

      {/* 통계 바 */}
      <section className="bg-brand-coal text-white py-6 px-4">
        <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-extrabold text-brand-orange">
                {s.value}
                <span className="text-sm text-stone-400">{s.sub}</span>
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 취급 제품 */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-extrabold text-brand-dark">취급 제품</h2>
          <span className="text-[11px] text-brand-muted">틸로코리아 공식 제품</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRODUCTS.map((p) => (
            <div
              key={p.name}
              className="bg-white rounded-2xl border border-gray-100 p-4 text-center hover:border-brand-orange/40 hover:shadow-sm transition"
            >
              <div className="text-3xl mb-2">{p.img}</div>
              <p className="text-sm font-extrabold text-brand-dark">{p.name}</p>
              <p className="text-[11px] text-brand-muted mt-1">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 파트너 유형 */}
      <section id="roles" className="bg-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-base font-extrabold text-brand-dark mb-1">파트너 유형 선택</h2>
          <p className="text-[12px] text-brand-muted mb-8">내 상황에 맞는 유형을 선택하세요</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {ROLES.map((role) => (
              <div
                key={role.id}
                className={`rounded-2xl border-2 flex flex-col overflow-hidden transition hover:shadow-md ${
                  role.highlight
                    ? 'border-brand-orange'
                    : 'border-gray-100'
                }`}
              >
                {role.highlight && (
                  <div className="bg-brand-orange text-white text-[11px] font-extrabold text-center py-1.5 tracking-widest">
                    추천
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1 bg-white">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{role.icon}</span>
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${role.highlight ? 'bg-brand-orange text-white' : 'bg-gray-100 text-brand-muted'}`}>
                        {role.badge}
                      </span>
                      <p className="text-sm font-extrabold text-brand-dark mt-0.5">{role.label}</p>
                    </div>
                  </div>
                  <p className="text-[12px] text-brand-muted leading-relaxed mb-4">{role.desc}</p>
                  <ul className="space-y-1.5 mb-5 flex-1">
                    {role.perks.map((perk) => (
                      <li key={perk} className="flex items-center gap-2 text-[12px] text-brand-coal">
                        <span className="w-4 h-4 rounded-full bg-brand-orange flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                          ✓
                        </span>
                        {perk}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => navigate(`/semi-dealer/apply?role=${role.id}`)}
                    className={`w-full py-2.5 rounded-full text-sm font-extrabold transition ${
                      role.highlight
                        ? 'bg-brand-orange text-white hover:bg-orange-600'
                        : 'bg-gray-50 text-brand-dark hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {role.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 등록 프로세스 */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-base font-extrabold text-brand-dark mb-8">등록 프로세스</h2>
        <div className="relative">
          <div className="absolute left-5 top-5 bottom-5 w-px bg-gray-200 sm:hidden" />
          <div className="space-y-6 sm:space-y-0 sm:grid sm:grid-cols-4 sm:gap-4">
            {[
              { n: '01', t: '유형 선택', d: '내 상황에 맞는 파트너 유형' },
              { n: '02', t: '신청서 작성', d: '간단한 정보 입력 (5분)' },
              { n: '03', t: '승인', d: '세미딜러 즉시 · 딜러 3~5일' },
              { n: '04', t: '활동 시작', d: '앱에서 바로 수익 관리' },
            ].map((item, i) => (
              <div key={item.n} className="flex sm:flex-col items-start sm:items-center gap-4 sm:gap-2 pl-12 sm:pl-0 relative">
                <div className="absolute left-0 sm:relative w-10 h-10 rounded-full bg-brand-orange text-white font-extrabold text-sm flex items-center justify-center flex-shrink-0">
                  {item.n}
                </div>
                <div className="sm:text-center">
                  <p className="font-extrabold text-brand-dark text-sm">{item.t}</p>
                  <p className="text-[11px] text-brand-muted mt-0.5">{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-base font-extrabold text-brand-dark mb-6">자주 묻는 질문</h2>
          <div className="space-y-2">
            {FAQ.map((f, i) => (
              <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                <button
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 hover:bg-gray-50 transition"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-sm font-bold text-brand-dark">{f.q}</span>
                  <span className={`text-brand-orange text-xl leading-none transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-45' : ''}`}>
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-[12px] text-brand-muted leading-relaxed border-t border-gray-50">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 하단 CTA */}
      <section className="bg-brand-dark text-white py-14 px-4 text-center">
        <h2 className="text-xl font-extrabold mb-2">지금 바로 시작하세요</h2>
        <p className="text-stone-400 text-sm mb-8">세미딜러 등록 즉시 승인 · 재고 없이 시작 가능</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={() => navigate('/semi-dealer/apply?role=introducer')}
            className="bg-brand-orange text-white font-extrabold px-8 py-3 rounded-full text-sm hover:bg-orange-600 transition"
          >
            세미딜러 등록
          </button>
          <button
            onClick={() => navigate('/semi-dealer/apply?role=official')}
            className="border border-stone-600 text-stone-300 font-bold px-8 py-3 rounded-full text-sm hover:bg-stone-800 transition"
          >
            정식 딜러 신청
          </button>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-brand-coal border-t border-stone-800 py-5 text-center text-[11px] text-stone-500">
        틸로코리아 · 딜러 파트너 프로그램 · 2026
      </footer>

      {/* 하단 네비게이션 (모바일) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-brand-dark border-t border-stone-800 flex justify-around py-2 z-50 sm:hidden">
        {[
          { label: '홈', icon: '🏠' },
          { label: '취급제품', icon: '🔩' },
          { label: '중고제품', icon: '♻️' },
          { label: '서비스접수', icon: '🛠️' },
          { label: '마이페이지', icon: '👤' },
        ].map((n) => (
          <button
            key={n.label}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 ${
              n.label === '홈' ? 'text-brand-orange' : 'text-stone-500 hover:text-stone-300'
            } transition`}
          >
            <span className="text-lg leading-none">{n.icon}</span>
            <span className="text-[9px] font-bold">{n.label}</span>
          </button>
        ))}
      </nav>
      <div className="h-16 sm:hidden" />
    </div>
  )
}
