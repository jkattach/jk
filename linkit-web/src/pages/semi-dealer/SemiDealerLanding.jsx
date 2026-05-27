import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const STATS = [
  { label: '누적 파트너', value: '320+', unit: '명' },
  { label: '월 거래액', value: '4.2억', unit: '원' },
  { label: '평균 수수료', value: '8%', unit: '' },
  { label: '정산 주기', value: '월 1회', unit: '' },
]

const ROLES = [
  {
    id: 'official',
    icon: '🏢',
    badge: '정식딜러',
    badgeColor: 'bg-orange-500 text-white',
    title: '정식 딜러',
    desc: '계약 후 도매가로 제품을 직접 공급받아 판매하는 공식 파트너',
    perks: ['도매 공급가 적용', '전용 영업 지원 제공', '제품 교육 + 마케팅 지원', '매월 정산 (10~15%)'],
    cta: '정식 딜러 신청',
    featured: true,
  },
  {
    id: 'introducer',
    icon: '🤝',
    badge: '세미딜러',
    badgeColor: 'bg-amber-100 text-amber-700',
    title: '세미딜러 (소개자)',
    desc: '재고 없이 소개 링크로 거래를 연결하고 건당 수수료를 받는 파트너',
    perks: ['소개 링크 즉시 발급', '건당 수수료 (5~8%)', '재고·계약 불필요', '앱에서 실적 실시간 조회'],
    cta: '세미딜러 등록',
    featured: false,
  },
  {
    id: 'consumer',
    icon: '👤',
    badge: '소비자',
    badgeColor: 'bg-gray-100 text-gray-600',
    title: '소비자 회원',
    desc: '제품을 구매한 고객으로 주문 이력·A/S 접수를 간편하게 관리',
    perks: ['주문 이력 조회', 'A/S 간편 접수', '재구매 할인 혜택', '멤버십 포인트 적립'],
    cta: '내 주문 보기',
    featured: false,
  },
]

const PRODUCTS = [
  { emoji: '🔄', name: '틸트로테이터', desc: '360° 회전 + 틸트' },
  { emoji: '🔗', name: '회전링크', desc: '굴착기 어태치먼트' },
  { emoji: '📐', name: '레벨기', desc: '정밀 수평 작업' },
  { emoji: '🔩', name: '퀵커플러', desc: '신속 교체 솔루션' },
  { emoji: '⚙️', name: '진동밸브', desc: '유압 진동 제어' },
]

const STEPS = [
  { n: '01', title: '유형 선택', desc: '내 상황에 맞는 파트너 유형 선택' },
  { n: '02', title: '신청서 작성', desc: '간단한 정보 입력 (약 5분)' },
  { n: '03', title: '승인', desc: '세미딜러 즉시 · 정식딜러 3~5일' },
  { n: '04', title: '활동 시작', desc: '앱에서 바로 수익 관리' },
]

const FAQS = [
  {
    q: '정식 딜러와 세미딜러의 차이는 무엇인가요?',
    a: '정식 딜러는 계약 후 도매가로 재고를 직접 구매하여 판매합니다. 세미딜러는 재고 없이 소개 링크로 거래를 연결하고 건당 수수료를 받습니다.',
  },
  {
    q: '수수료는 언제, 어떻게 지급되나요?',
    a: '매월 말일 기준으로 익월 10일 이내에 등록하신 계좌로 정산됩니다. 세미딜러 5~8%, 정식딜러 10~15%가 적용됩니다.',
  },
  {
    q: '신청 후 승인까지 얼마나 걸리나요?',
    a: '세미딜러는 즉시 승인됩니다. 정식 딜러는 서류 검토 후 영업일 3~5일 내 담당자가 연락드립니다.',
  },
  {
    q: '세미딜러에게 필요한 초기 비용이 있나요?',
    a: '없습니다. 세미딜러는 재고 구매나 계약금 없이 무료로 등록하고 즉시 활동을 시작할 수 있습니다.',
  },
]

export default function SemiDealerLanding() {
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="white"/>
            </svg>
          </div>
          <span className="text-[17px] font-extrabold text-gray-900 tracking-tight">링크잇</span>
          <span className="text-[10px] bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded-full">파트너</span>
        </div>
        <button
          onClick={() => navigate('/semi-dealer/dashboard')}
          className="text-[12px] bg-orange-500 text-white font-bold px-4 py-1.5 rounded-full"
        >
          내 대시보드
        </button>
      </header>

      {/* 히어로 */}
      <section className="bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 px-4 pt-10 pb-12 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute right-0 top-0 w-48 h-48 bg-white rounded-full -translate-y-1/2 translate-x-1/2"/>
          <div className="absolute left-0 bottom-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2"/>
        </div>
        <div className="relative">
          <span className="inline-block text-[11px] font-bold bg-white/20 border border-white/30 px-3 py-1 rounded-full mb-4 tracking-widest uppercase">
            Partner Program
          </span>
          <h1 className="text-[26px] font-extrabold leading-tight mb-3">
            링크잇과 함께<br />수익을 만드세요
          </h1>
          <p className="text-orange-100 text-[13px] leading-relaxed mb-7">
            틸트로테이터 · 회전링크 · 레벨기 · 퀵커플러<br />
            내 방식대로 판매하고, 건당 수수료를 받으세요
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/semi-dealer/apply?role=introducer')}
              className="bg-white text-orange-500 font-extrabold px-6 py-2.5 rounded-full text-[14px] shadow-lg"
            >
              세미딜러 등록
            </button>
            <button
              onClick={() => document.getElementById('roles').scrollIntoView({ behavior: 'smooth' })}
              className="border-2 border-white/60 text-white font-bold px-6 py-2.5 rounded-full text-[14px]"
            >
              유형 비교
            </button>
          </div>
        </div>
      </section>

      {/* 통계 */}
      <section className="bg-white px-4 py-5 grid grid-cols-4 gap-2 border-b border-gray-100">
        {STATS.map(s => (
          <div key={s.label} className="text-center">
            <p className="text-[17px] font-extrabold text-orange-500 leading-tight">
              {s.value}<span className="text-[11px] text-gray-400">{s.unit}</span>
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{s.label}</p>
          </div>
        ))}
      </section>

      {/* 취급 제품 */}
      <section className="bg-white mt-2 px-4 pt-5 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-extrabold text-gray-900">취급 제품</h2>
          <span className="text-[11px] text-gray-400">링크잇 공식 제품</span>
        </div>
        <div className="flex gap-3 overflow-x-auto scroll-hide">
          {PRODUCTS.map(p => (
            <div key={p.name} className="flex-shrink-0 w-24 flex flex-col items-center gap-1.5">
              <div className="w-16 h-16 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                {p.emoji}
              </div>
              <p className="text-[11px] font-bold text-gray-800 text-center leading-tight">{p.name}</p>
              <p className="text-[10px] text-gray-400 text-center leading-tight">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 파트너 유형 */}
      <section id="roles" className="bg-white mt-2 px-4 pt-5 pb-6">
        <h2 className="text-[16px] font-extrabold text-gray-900 mb-1">파트너 유형 선택</h2>
        <p className="text-[12px] text-gray-400 mb-4">내 상황에 맞는 유형을 선택하세요</p>
        <div className="flex flex-col gap-3">
          {ROLES.map(role => (
            <div
              key={role.id}
              className={`rounded-2xl border-2 overflow-hidden ${role.featured ? 'border-orange-400' : 'border-gray-100'}`}
            >
              {role.featured && (
                <div className="bg-orange-500 text-white text-[11px] font-extrabold text-center py-1.5 tracking-widest">
                  ★ 추천
                </div>
              )}
              <div className="bg-white p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{role.icon}</span>
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${role.badgeColor}`}>
                      {role.badge}
                    </span>
                    <p className="text-[15px] font-extrabold text-gray-900 mt-0.5">{role.title}</p>
                  </div>
                </div>
                <p className="text-[12px] text-gray-500 leading-relaxed mb-3">{role.desc}</p>
                <ul className="space-y-1.5 mb-4">
                  {role.perks.map(perk => (
                    <li key={perk} className="flex items-center gap-2 text-[12px] text-gray-700">
                      <span className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0">✓</span>
                      {perk}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate(`/semi-dealer/apply?role=${role.id}`)}
                  className={`w-full py-2.5 rounded-xl text-[14px] font-extrabold transition ${
                    role.featured
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-50 text-gray-800 border border-gray-200'
                  }`}
                >
                  {role.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 등록 프로세스 */}
      <section className="bg-white mt-2 px-4 pt-5 pb-6">
        <h2 className="text-[16px] font-extrabold text-gray-900 mb-5">등록 프로세스</h2>
        <div className="relative pl-6">
          <div className="absolute left-[18px] top-4 bottom-4 w-0.5 bg-orange-100"/>
          <div className="flex flex-col gap-5">
            {STEPS.map((step, i) => (
              <div key={step.n} className="flex items-start gap-4 relative">
                <div className="w-9 h-9 rounded-full bg-orange-500 text-white font-extrabold text-[12px] flex items-center justify-center flex-shrink-0 -ml-[6px] ring-4 ring-white z-10">
                  {step.n}
                </div>
                <div className="pt-1">
                  <p className="text-[14px] font-bold text-gray-900">{step.title}</p>
                  <p className="text-[12px] text-gray-400 mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white mt-2 px-4 pt-5 pb-6">
        <h2 className="text-[16px] font-extrabold text-gray-900 mb-4">자주 묻는 질문</h2>
        <div className="flex flex-col gap-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-3.5 text-left active:bg-gray-50"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="text-[14px] font-semibold text-gray-800 pr-2">{faq.q}</span>
                <span className={`text-orange-500 text-lg flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 bg-gray-50 text-[13px] text-gray-600 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 하단 CTA */}
      <section className="bg-gradient-to-r from-orange-500 to-amber-400 mt-2 px-4 py-10 text-center text-white">
        <h2 className="text-[20px] font-extrabold mb-2">지금 바로 시작하세요</h2>
        <p className="text-orange-100 text-[13px] mb-6">세미딜러 등록 즉시 승인 · 재고 없이 시작 가능</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate('/semi-dealer/apply?role=introducer')}
            className="bg-white text-orange-500 font-extrabold px-7 py-3 rounded-full text-[14px] shadow-md"
          >
            세미딜러 등록
          </button>
          <button
            onClick={() => navigate('/semi-dealer/apply?role=official')}
            className="border-2 border-white/60 text-white font-bold px-7 py-3 rounded-full text-[14px]"
          >
            정식딜러 신청
          </button>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-white border-t border-gray-100 px-4 py-5 text-center">
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <div className="w-5 h-5 bg-orange-500 rounded-md flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="white"/>
            </svg>
          </div>
          <span className="text-[13px] font-extrabold text-gray-800">링크잇 파트너 프로그램</span>
        </div>
        <p className="text-[11px] text-gray-400">© 2025 링크잇. All rights reserved.</p>
      </footer>
    </div>
  )
}
