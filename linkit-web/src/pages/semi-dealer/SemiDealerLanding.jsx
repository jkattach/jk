import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ROLES = [
  {
    id: 'official',
    label: '정식 딜러',
    badge: 'OFFICIAL',
    badgeColor: 'bg-linkit-blue text-white',
    icon: '🏢',
    desc: '링크잇과 공식 딜러 계약을 맺고 도매가로 제품을 공급받아 판매하는 파트너',
    perks: ['도매 공급가 적용', '전용 영업지원', '제품 교육 제공', '월정산 수수료'],
    cta: '정식 딜러 신청',
    highlight: true,
  },
  {
    id: 'introducer',
    label: '비공식 총판 · 소개자',
    badge: 'SEMI',
    badgeColor: 'bg-linkit-sky text-white',
    icon: '🤝',
    desc: '링크잇 제품을 지인·현장에 소개하고 소개 수수료를 받는 파트너',
    perks: ['소개 링크 발급', '건당 수수료 지급', '별도 계약 불필요', '앱에서 실적 조회'],
    cta: '소개자 등록',
    highlight: false,
  },
  {
    id: 'consumer',
    label: '소비자 (구매 이력)',
    badge: 'USER',
    badgeColor: 'bg-gray-500 text-white',
    icon: '👤',
    desc: '링크잇 제품을 구매한 고객으로, 나의 주문 이력과 A/S 접수를 관리합니다',
    perks: ['주문 이력 조회', 'A/S 접수', '재구매 할인', '멤버십 적립'],
    cta: '내 주문 보기',
    highlight: false,
  },
]

const STATS = [
  { label: '누적 딜러 수', value: '320+', unit: '명' },
  { label: '월 거래액', value: '4.2억', unit: '원' },
  { label: '평균 수수료율', value: '8', unit: '%' },
  { label: '정산 주기', value: '월 1회', unit: '' },
]

const FAQ = [
  { q: '정식 딜러와 소개자의 차이는 무엇인가요?', a: '정식 딜러는 계약 후 도매가로 직접 재고를 구매·판매합니다. 소개자는 재고 없이 소개 링크만으로 거래를 연결하고 수수료를 받습니다.' },
  { q: '수수료는 언제 지급되나요?', a: '매월 말일 기준으로 익월 10일 이내에 등록하신 계좌로 정산됩니다.' },
  { q: '신청 후 승인까지 얼마나 걸리나요?', a: '소개자는 즉시 승인, 정식 딜러는 서류 검토 후 영업일 3~5일 내 담당자가 연락드립니다.' },
]

export default function SemiDealerLanding() {
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* 헤더 */}
      <header className="bg-linkit-indigo text-white py-3 px-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-linkit-green font-extrabold text-xl tracking-tight">LINKIT</span>
          <span className="text-xs bg-linkit-green text-linkit-indigo font-bold px-2 py-0.5 rounded-full">세미딜러</span>
        </div>
        <button
          onClick={() => navigate('/semi-dealer/dashboard')}
          className="text-xs bg-linkit-action text-white font-bold px-4 py-1.5 rounded-pill hover:opacity-90 transition"
        >
          대시보드 →
        </button>
      </header>

      {/* 히어로 */}
      <section className="bg-linkit-indigo text-white pt-16 pb-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #59BDED 0%, transparent 50%), radial-gradient(circle at 80% 20%, #C4D700 0%, transparent 40%)' }} />
        <div className="relative max-w-2xl mx-auto">
          <span className="inline-block text-xs font-bold bg-linkit-green text-linkit-indigo px-3 py-1 rounded-full mb-4 tracking-widest">
            LINKIT PARTNER PROGRAM
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight">
            링크잇과 함께<br />
            <span className="text-linkit-green">수익을 만들어보세요</span>
          </h1>
          <p className="text-linkit-sky text-sm sm:text-base mb-8 leading-relaxed">
            정식 딜러부터 소개자까지 — 내 상황에 맞는 파트너십으로<br className="hidden sm:block" />
            틸트로테이터·회전링크·어태치먼트 수산 제품을 판매하세요
          </p>
          <button
            onClick={() => document.getElementById('roles').scrollIntoView({ behavior: 'smooth' })}
            className="bg-linkit-action text-white font-bold px-8 py-3 rounded-pill text-sm hover:opacity-90 transition shadow-lg"
          >
            파트너십 유형 보기
          </button>
        </div>
      </section>

      {/* 통계 */}
      <section className="bg-linkit-blue text-white py-8 px-4">
        <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-extrabold text-linkit-green">
                {s.value}<span className="text-base text-linkit-sky">{s.unit}</span>
              </div>
              <div className="text-xs text-blue-200 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 역할 카드 */}
      <section id="roles" className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-center text-xl font-extrabold text-linkit-indigo mb-2">파트너 유형 선택</h2>
        <p className="text-center text-gray-500 text-sm mb-10">3가지 유형 중 내 상황에 맞는 파트너십을 선택하세요</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {ROLES.map((role) => (
            <div
              key={role.id}
              className={`bg-white rounded-2xl shadow-sm border-2 flex flex-col transition hover:shadow-md ${
                role.highlight ? 'border-linkit-blue' : 'border-gray-100'
              }`}
            >
              {role.highlight && (
                <div className="bg-linkit-blue text-white text-xs font-bold text-center py-1.5 rounded-t-2xl tracking-wider">
                  RECOMMENDED
                </div>
              )}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{role.icon}</span>
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${role.badgeColor}`}>
                      {role.badge}
                    </span>
                    <p className="text-sm font-extrabold text-linkit-indigo mt-0.5">{role.label}</p>
                  </div>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed mb-4">{role.desc}</p>
                <ul className="space-y-1.5 mb-6 flex-1">
                  {role.perks.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-xs text-gray-700">
                      <span className="w-4 h-4 rounded-full bg-linkit-green flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">✓</span>
                      {p}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate(`/semi-dealer/apply?role=${role.id}`)}
                  className={`w-full py-2.5 rounded-pill text-sm font-bold transition ${
                    role.highlight
                      ? 'bg-linkit-blue text-white hover:opacity-90'
                      : 'bg-gray-100 text-linkit-indigo hover:bg-gray-200'
                  }`}
                >
                  {role.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 프로세스 */}
      <section className="bg-white py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-center text-xl font-extrabold text-linkit-indigo mb-10">파트너 등록 프로세스</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            {[
              { step: '01', title: '유형 선택', desc: '나에게 맞는 파트너 유형 선택' },
              { step: '02', title: '신청서 작성', desc: '간단한 정보 입력 (5분)' },
              { step: '03', title: '승인', desc: '소개자 즉시 · 딜러 3~5일' },
              { step: '04', title: '활동 시작', desc: '대시보드에서 수익 관리' },
            ].map((item, i) => (
              <div key={item.step} className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-2 flex-1">
                <div className="w-10 h-10 rounded-full bg-linkit-indigo text-white font-extrabold text-sm flex items-center justify-center flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <p className="font-bold text-linkit-indigo text-sm">{item.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                </div>
                {i < 3 && <div className="hidden sm:block h-px flex-1 bg-gray-200 mt-1" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-4 py-14">
        <h2 className="text-center text-xl font-extrabold text-linkit-indigo mb-8">자주 묻는 질문</h2>
        <div className="space-y-3">
          {FAQ.map((f, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <button
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-3"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="text-sm font-bold text-linkit-indigo">{f.q}</span>
                <span className={`text-linkit-blue text-lg transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 text-xs text-gray-600 leading-relaxed border-t border-gray-50">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 하단 CTA */}
      <section className="bg-linkit-indigo text-white py-14 px-4 text-center">
        <h2 className="text-xl font-extrabold mb-3">지금 바로 파트너로 시작하세요</h2>
        <p className="text-linkit-sky text-sm mb-8">소개자 등록은 즉시 승인 · 재고 없이 시작 가능</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate('/semi-dealer/apply?role=introducer')}
            className="bg-linkit-green text-linkit-indigo font-extrabold px-7 py-3 rounded-pill text-sm hover:opacity-90 transition"
          >
            소개자 등록
          </button>
          <button
            onClick={() => navigate('/semi-dealer/apply?role=official')}
            className="border border-linkit-sky text-linkit-sky font-bold px-7 py-3 rounded-pill text-sm hover:bg-linkit-sky hover:text-white transition"
          >
            딜러 신청
          </button>
        </div>
      </section>

      <footer className="bg-linkit-indigo border-t border-white/10 text-center py-5 text-xs text-blue-300">
        링크잇(Linkit) · 세미딜러 파트너 프로그램 · 2026
      </footer>
    </div>
  )
}
