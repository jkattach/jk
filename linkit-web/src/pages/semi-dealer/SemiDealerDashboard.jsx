import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

/* ── Mock 데이터 ── */
const MOCK_USER = { name: '김현장', level: '세미딜러', joinedAt: '2025.03.12' }

const MOCK_STATS = {
  official:   { commission: '1,240,000', orders: 38, customers: 12, pending: '280,000' },
  introducer: { commission: '320,000',   orders: 9,  customers: null, pending: '80,000' },
  consumer:   { commission: null,         orders: 3,  customers: null, pending: null },
}

const MOCK_ORDERS = [
  { id: 'TL-0934', product: '틸트로테이터 TS35', customer: '박기사', amount: '980,000', status: '배송완료', date: '2026.05.18' },
  { id: 'TL-0912', product: '회전링크 6W',        customer: '이현장', amount: '420,000', status: '처리중',   date: '2026.05.14' },
  { id: 'TL-0891', product: '레벨기 세트',        customer: '최팀장', amount: '310,000', status: '접수대기', date: '2026.05.10' },
]

const MOCK_LINKS = [
  { code: 'KH-2934', label: '틸트로테이터 메인', clicks: 34, conversions: 2, earned: '96,000' },
  { code: 'KH-2935', label: '회전링크 이벤트',   clicks: 18, conversions: 1, earned: '42,000' },
]

const STATUS_STYLE = {
  '배송완료': 'bg-green-50 text-green-700',
  '처리중':   'bg-blue-50 text-blue-700',
  '접수대기': 'bg-orange-50 text-brand-orange',
}

const NAV_ITEMS = [
  { label: '홈',      icon: '🏠' },
  { label: '소개링크', icon: '🔗' },
  { label: '주문',    icon: '📦' },
  { label: '고객',    icon: '👥', officialOnly: true },
  { label: '설정',    icon: '⚙️' },
]

/* ── 컴포넌트 ── */
export default function SemiDealerDashboard() {
  const navigate = useNavigate()
  const [role, setRole] = useState('introducer')
  const [tab, setTab] = useState('홈')
  const [copied, setCopied] = useState(null)

  const stats = MOCK_STATS[role]

  const visibleNav = NAV_ITEMS.filter((n) => {
    if (n.officialOnly && role !== 'official') return false
    if (n.label === '소개링크' && role === 'consumer') return false
    return true
  })

  const handleCopy = (code) => {
    navigator.clipboard.writeText(`https://tilro.kr/ref/${code}`)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">

      {/* 헤더 */}
      <header className="bg-brand-dark text-white sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-brand-orange font-extrabold text-base">틸로코리아</span>
            <span className="text-[10px] bg-brand-orange text-white font-bold px-2 py-0.5 rounded-full">
              {role === 'official' ? '정식딜러' : role === 'introducer' ? '세미딜러' : '소비자'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* 개발용 역할 전환 */}
            <select
              value={role}
              onChange={(e) => { setRole(e.target.value); setTab('홈') }}
              className="text-[10px] bg-stone-800 border border-stone-700 text-white rounded-lg px-2 py-1"
            >
              <option value="official">정식딜러</option>
              <option value="introducer">세미딜러</option>
              <option value="consumer">소비자</option>
            </select>
            <button onClick={() => navigate('/semi-dealer')} className="text-[11px] text-stone-400 hover:text-white transition">
              로그아웃
            </button>
          </div>
        </div>

        {/* 탭 바 */}
        <div className="max-w-2xl mx-auto px-4 flex overflow-x-auto border-t border-stone-800">
          {visibleNav.map((n) => (
            <button
              key={n.label}
              onClick={() => setTab(n.label)}
              className={`text-[11px] font-bold px-4 py-2.5 border-b-2 whitespace-nowrap transition ${
                tab === n.label
                  ? 'border-brand-orange text-brand-orange'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              {n.label}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5">

        {/* 홈 탭 */}
        {tab === '홈' && (
          <>
            {/* 프로필 카드 */}
            <div className="bg-brand-dark text-white rounded-2xl p-5 mb-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-orange flex items-center justify-center text-white font-extrabold text-xl flex-shrink-0">
                {MOCK_USER.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-base">{MOCK_USER.name} 님</p>
                <p className="text-[11px] text-stone-400">{MOCK_USER.level} · {MOCK_USER.joinedAt} 가입</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-stone-500 mb-0.5">이번 달 수수료</p>
                <p className="text-brand-orange font-extrabold text-base">
                  {stats.commission ? `${stats.commission}원` : '-'}
                </p>
              </div>
            </div>

            {/* 통계 카드 */}
            <div className={`grid gap-3 mb-4 ${role === 'consumer' ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {stats.pending && (
                <StatCard label="정산 예정" value={`${stats.pending}원`} color="text-brand-amber" />
              )}
              <StatCard label="총 주문 수" value={`${stats.orders}건`} color="text-brand-dark" />
              {stats.customers && (
                <StatCard label="내 고객 수" value={`${stats.customers}명`} color="text-brand-muted" />
              )}
            </div>

            {/* 최근 주문 */}
            <SectionTitle icon="📦" onMore={() => setTab('주문')}>최근 주문</SectionTitle>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4">
              {MOCK_ORDERS.slice(0, 3).map((o, i) => (
                <div
                  key={o.id}
                  className={`px-4 py-3 flex items-center gap-3 ${i < 2 ? 'border-b border-gray-50' : ''}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-extrabold text-brand-dark truncate">{o.product}</p>
                    <p className="text-[10px] text-brand-muted">{o.id} · {o.date}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_STYLE[o.status]}`}>
                    {o.status}
                  </span>
                  <span className="text-xs font-extrabold text-brand-dark flex-shrink-0">{o.amount}원</span>
                </div>
              ))}
              <button
                onClick={() => setTab('주문')}
                className="w-full text-[11px] text-brand-orange font-bold py-2.5 hover:bg-gray-50 transition border-t border-gray-50"
              >
                전체 보기 →
              </button>
            </div>

            {/* 소개 링크 (소개자/딜러) */}
            {role !== 'consumer' && (
              <>
                <SectionTitle icon="🔗" onMore={() => setTab('소개링크')}>내 소개 링크</SectionTitle>
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  {MOCK_LINKS.map((l, i) => (
                    <div
                      key={l.code}
                      className={`px-4 py-3 flex items-center gap-3 ${i < MOCK_LINKS.length - 1 ? 'border-b border-gray-50' : ''}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-extrabold text-brand-dark">{l.label}</p>
                        <p className="text-[10px] text-brand-muted">
                          클릭 {l.clicks} · 전환 {l.conversions} · 수익 {l.earned}원
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopy(l.code)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-full flex-shrink-0 transition ${
                          copied === l.code
                            ? 'bg-green-100 text-green-700'
                            : 'bg-brand-orange text-white hover:bg-orange-600'
                        }`}
                      >
                        {copied === l.code ? '복사됨 ✓' : '복사'}
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setTab('소개링크')}
                    className="w-full text-[11px] text-brand-orange font-bold py-2.5 hover:bg-gray-50 transition border-t border-gray-50"
                  >
                    링크 관리 →
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* 소개링크 탭 */}
        {tab === '소개링크' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-extrabold text-brand-dark">소개 링크 관리</h2>
              <button className="text-[11px] bg-brand-orange text-white font-bold px-4 py-1.5 rounded-full hover:bg-orange-600 transition">
                + 새 링크
              </button>
            </div>
            <div className="space-y-3">
              {MOCK_LINKS.map((l) => (
                <div key={l.code} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="font-extrabold text-brand-dark text-sm">{l.label}</p>
                      <p className="text-[10px] text-brand-muted font-mono mt-0.5">tilro.kr/ref/{l.code}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(l.code)}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-full flex-shrink-0 transition ${
                        copied === l.code
                          ? 'bg-green-100 text-green-700'
                          : 'bg-brand-orange text-white hover:bg-orange-600'
                      }`}
                    >
                      {copied === l.code ? '복사됨 ✓' : '링크 복사'}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: '클릭', value: l.clicks, color: 'text-brand-dark' },
                      { label: '전환', value: l.conversions, color: 'text-brand-amber' },
                      { label: '수익', value: `${l.earned}원`, color: 'text-brand-orange' },
                    ].map((m) => (
                      <div key={m.label} className="bg-gray-50 rounded-xl py-2.5">
                        <p className={`text-base font-extrabold ${m.color}`}>{m.value}</p>
                        <p className="text-[10px] text-brand-muted">{m.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-brand-light border border-orange-100 rounded-2xl p-4">
              <p className="text-[11px] font-bold text-brand-orange mb-2">수수료 정책</p>
              <ul className="text-[11px] text-brand-muted space-y-1">
                <li>· 세미딜러: 판매가의 <strong className="text-brand-dark">5~8%</strong></li>
                <li>· 정식 딜러: 판매가의 <strong className="text-brand-dark">10~15%</strong></li>
                <li>· 매월 말일 정산 → 익월 10일 이내 지급</li>
              </ul>
            </div>
          </>
        )}

        {/* 주문 탭 */}
        {tab === '주문' && (
          <>
            <h2 className="text-sm font-extrabold text-brand-dark mb-4">주문 목록</h2>
            <div className="space-y-2">
              {MOCK_ORDERS.map((o) => (
                <div key={o.id} className="bg-white rounded-2xl border border-gray-100 px-5 py-4">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <p className="text-sm font-extrabold text-brand-dark">{o.product}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_STYLE[o.status]}`}>
                      {o.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-brand-muted">
                    <span>{o.id} · {o.customer} · {o.date}</span>
                    <span className="font-extrabold text-brand-dark">{o.amount}원</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 고객 탭 */}
        {tab === '고객' && role === 'official' && (
          <>
            <h2 className="text-sm font-extrabold text-brand-dark mb-4">고객 관리</h2>
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <p className="text-sm text-brand-muted">고객 데이터를 불러오는 중입니다.</p>
            </div>
          </>
        )}

        {/* 설정 탭 */}
        {tab === '설정' && (
          <>
            <h2 className="text-sm font-extrabold text-brand-dark mb-4">계정 설정</h2>

            {/* 프로필 미니카드 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-orange flex items-center justify-center text-white font-extrabold">
                {MOCK_USER.name[0]}
              </div>
              <div>
                <p className="text-sm font-extrabold text-brand-dark">{MOCK_USER.name}</p>
                <p className="text-[11px] text-brand-muted">{MOCK_USER.level} · {MOCK_USER.joinedAt} 가입</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
              {['프로필 수정', '정산 계좌 관리', '알림 설정', '비밀번호 변경'].map((item) => (
                <button
                  key={item}
                  className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <span className="text-sm text-brand-dark font-bold">{item}</span>
                  <span className="text-brand-muted">›</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate('/semi-dealer')}
              className="mt-3 w-full py-3 rounded-full text-sm font-bold text-red-400 border border-red-100 hover:bg-red-50 transition"
            >
              로그아웃
            </button>
          </>
        )}
      </div>

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-brand-dark border-t border-stone-800 flex justify-around py-2 z-50">
        {visibleNav.map((n) => (
          <button
            key={n.label}
            onClick={() => setTab(n.label)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 transition ${
              tab === n.label ? 'text-brand-orange' : 'text-stone-500 hover:text-stone-300'
            }`}
          >
            <span className="text-xl leading-none">{n.icon}</span>
            <span className="text-[9px] font-bold">{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

/* ── 서브 컴포넌트 ── */
function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <p className="text-[10px] text-brand-muted mb-1">{label}</p>
      <p className={`text-lg font-extrabold ${color}`}>{value}</p>
    </div>
  )
}

function SectionTitle({ icon, children, onMore }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-xs font-extrabold text-brand-dark flex items-center gap-1.5">
        <span>{icon}</span> {children}
      </h3>
      {onMore && (
        <button onClick={onMore} className="text-[10px] text-brand-orange font-bold hover:underline">
          전체보기
        </button>
      )}
    </div>
  )
}
