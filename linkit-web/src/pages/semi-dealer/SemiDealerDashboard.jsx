import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

/* ─── Mock 데이터 ─── */
const MOCK_USER = { name: '김현장', role: 'introducer', level: '세미딜러 3등급', joinedAt: '2025-03-12' }

const MOCK_STATS = {
  official:   { commission: '1,240,000', orders: 38, customers: 12, pending: '280,000' },
  introducer: { commission: '320,000',   orders: 9,  customers: 5,  pending: '80,000' },
  consumer:   { commission: null,         orders: 3,  customers: null, pending: null },
}

const MOCK_ORDERS = [
  { id: 'LK-0934', product: '틸트로테이터 TS35', customer: '박기사', amount: '980,000', status: '배송완료', date: '2026-05-18' },
  { id: 'LK-0912', product: '회전링크 6W', customer: '이현장', amount: '420,000', status: '처리중', date: '2026-05-14' },
  { id: 'LK-0891', product: '레벨기 세트', customer: '최팀장', amount: '310,000', status: '접수대기', date: '2026-05-10' },
]

const MOCK_REF_LINKS = [
  { code: 'JH-2934', label: '틸트로테이터 메인', clicks: 34, conversions: 2, earned: '96,000' },
  { code: 'JH-2935', label: '회전링크 이벤트', clicks: 18, conversions: 1, earned: '42,000' },
]

const STATUS_STYLE = {
  '배송완료': 'bg-green-100 text-green-700',
  '처리중':   'bg-blue-100 text-blue-700',
  '접수대기': 'bg-yellow-100 text-yellow-700',
}

const TABS = ['홈', '소개링크', '주문', '고객', '설정']

/* ─── 컴포넌트 ─── */
export default function SemiDealerDashboard() {
  const navigate = useNavigate()
  const [role, setRole] = useState('introducer') // 개발 중 역할 전환용
  const [tab, setTab] = useState('홈')
  const [copied, setCopied] = useState(null)

  const stats = MOCK_STATS[role]

  const handleCopy = (code) => {
    navigator.clipboard.writeText(`https://linkit.kr/ref/${code}`)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">

      {/* 헤더 */}
      <header className="bg-linkit-indigo text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-linkit-green font-extrabold text-lg">LINKIT</span>
            <span className="text-[10px] bg-linkit-green text-linkit-indigo font-bold px-2 py-0.5 rounded-full">세미딜러</span>
          </div>
          <div className="flex items-center gap-3">
            {/* 개발용 역할 전환 */}
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="text-[10px] bg-white/10 border border-white/20 text-white rounded px-2 py-1"
            >
              <option value="official">정식딜러</option>
              <option value="introducer">소개자</option>
              <option value="consumer">소비자</option>
            </select>
            <button onClick={() => navigate('/semi-dealer')} className="text-xs text-linkit-sky hover:text-white">로그아웃</button>
          </div>
        </div>
        {/* 탭 */}
        <div className="max-w-4xl mx-auto px-4 flex gap-1 pb-0 overflow-x-auto">
          {TABS.filter(t => {
            if (role === 'consumer') return ['홈', '주문', '설정'].includes(t)
            if (role === 'introducer') return t !== '고객'
            return true
          }).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-xs font-bold px-4 py-2 border-b-2 whitespace-nowrap transition ${
                tab === t ? 'border-linkit-green text-linkit-green' : 'border-transparent text-blue-200 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* 홈 탭 */}
        {tab === '홈' && (
          <>
            {/* 프로필 카드 */}
            <div className="bg-linkit-indigo text-white rounded-2xl p-5 mb-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-linkit-green flex items-center justify-center text-linkit-indigo font-extrabold text-lg flex-shrink-0">
                {MOCK_USER.name[0]}
              </div>
              <div className="flex-1">
                <p className="font-extrabold text-base">{MOCK_USER.name} 님</p>
                <p className="text-xs text-linkit-sky">{MOCK_USER.level} · {MOCK_USER.joinedAt} 가입</p>
              </div>
              <RoleBadge role={role} />
            </div>

            {/* 통계 카드 */}
            <div className={`grid gap-4 mb-5 ${role === 'consumer' ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-4'}`}>
              {stats.commission && (
                <StatCard label="이번 달 수수료" value={`${stats.commission}원`} accent color="text-linkit-green" />
              )}
              {stats.pending && (
                <StatCard label="정산 예정" value={`${stats.pending}원`} color="text-linkit-action" />
              )}
              <StatCard label="총 주문 수" value={`${stats.orders}건`} color="text-linkit-sky" />
              {stats.customers && (
                <StatCard label="고객 수" value={`${stats.customers}명`} color="text-gray-700" />
              )}
            </div>

            {/* 최근 주문 */}
            <SectionTitle>최근 주문</SectionTitle>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-5">
              {MOCK_ORDERS.slice(0, 3).map((o, i) => (
                <div key={o.id} className={`px-5 py-3.5 flex items-center gap-3 ${i < 2 ? 'border-b border-gray-50' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-linkit-indigo truncate">{o.product}</p>
                    <p className="text-[10px] text-gray-400">{o.id} · {o.date}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[o.status]}`}>{o.status}</span>
                  <span className="text-xs font-bold text-gray-700">{o.amount}원</span>
                </div>
              ))}
              <button onClick={() => setTab('주문')} className="w-full text-xs text-linkit-blue font-bold py-3 hover:bg-gray-50 transition">
                전체 보기 →
              </button>
            </div>

            {/* 소개 링크 (소개자/딜러만) */}
            {role !== 'consumer' && (
              <>
                <SectionTitle>내 소개 링크</SectionTitle>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {MOCK_REF_LINKS.map((l, i) => (
                    <div key={l.code} className={`px-5 py-3.5 flex items-center gap-3 ${i < MOCK_REF_LINKS.length - 1 ? 'border-b border-gray-50' : ''}`}>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-linkit-indigo">{l.label}</p>
                        <p className="text-[10px] text-gray-400">클릭 {l.clicks} · 전환 {l.conversions} · 수익 {l.earned}원</p>
                      </div>
                      <button
                        onClick={() => handleCopy(l.code)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-full transition ${
                          copied === l.code ? 'bg-linkit-green text-linkit-indigo' : 'bg-gray-100 text-gray-600 hover:bg-linkit-sky hover:text-white'
                        }`}
                      >
                        {copied === l.code ? '복사됨!' : '링크 복사'}
                      </button>
                    </div>
                  ))}
                  <button onClick={() => setTab('소개링크')} className="w-full text-xs text-linkit-blue font-bold py-3 hover:bg-gray-50 transition">
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
              <SectionTitle>소개 링크 관리</SectionTitle>
              <button className="text-xs bg-linkit-blue text-white font-bold px-4 py-1.5 rounded-pill hover:opacity-90 transition">
                + 새 링크 생성
              </button>
            </div>
            <div className="space-y-3">
              {MOCK_REF_LINKS.map((l) => (
                <div key={l.code} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-bold text-linkit-indigo text-sm">{l.label}</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">linkit.kr/ref/{l.code}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(l.code)}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-full transition flex-shrink-0 ${
                        copied === l.code ? 'bg-linkit-green text-linkit-indigo' : 'bg-linkit-blue text-white hover:opacity-90'
                      }`}
                    >
                      {copied === l.code ? '복사됨 ✓' : '링크 복사'}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-gray-50 rounded-xl py-2">
                      <p className="text-base font-extrabold text-linkit-indigo">{l.clicks}</p>
                      <p className="text-[10px] text-gray-400">클릭</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl py-2">
                      <p className="text-base font-extrabold text-linkit-sky">{l.conversions}</p>
                      <p className="text-[10px] text-gray-400">전환</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl py-2">
                      <p className="text-base font-extrabold text-linkit-green">{l.earned}원</p>
                      <p className="text-[10px] text-gray-400">수익</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 수수료 안내 */}
            <div className="mt-5 bg-linkit-indigo/5 border border-linkit-indigo/10 rounded-2xl p-5">
              <p className="text-xs font-bold text-linkit-indigo mb-2">수수료 정책</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>· 소개자: 판매가의 <strong className="text-linkit-blue">5~8%</strong> 지급</li>
                <li>· 정식 딜러: 판매가의 <strong className="text-linkit-blue">10~15%</strong> 지급</li>
                <li>· 매월 말일 정산 → 익월 10일 이내 지급</li>
              </ul>
            </div>
          </>
        )}

        {/* 주문 탭 */}
        {tab === '주문' && (
          <>
            <SectionTitle>주문 목록</SectionTitle>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-4 bg-gray-50 text-[10px] font-bold text-gray-500 px-5 py-2.5 border-b border-gray-100">
                <span>주문번호·상품</span><span className="text-center">금액</span><span className="text-center">고객</span><span className="text-right">상태</span>
              </div>
              {MOCK_ORDERS.map((o, i) => (
                <div key={o.id} className={`grid grid-cols-4 items-center px-5 py-3.5 ${i < MOCK_ORDERS.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <div>
                    <p className="text-xs font-bold text-linkit-indigo truncate">{o.product}</p>
                    <p className="text-[10px] text-gray-400">{o.id} · {o.date}</p>
                  </div>
                  <p className="text-xs font-bold text-gray-700 text-center">{o.amount}원</p>
                  <p className="text-xs text-gray-500 text-center">{o.customer}</p>
                  <div className="flex justify-end">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[o.status]}`}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 고객 탭 (딜러만) */}
        {tab === '고객' && role === 'official' && (
          <>
            <SectionTitle>고객 관리</SectionTitle>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <p className="text-xs text-gray-400 text-center py-8">고객 데이터를 불러오는 중입니다.</p>
            </div>
          </>
        )}

        {/* 설정 탭 */}
        {tab === '설정' && (
          <>
            <SectionTitle>계정 설정</SectionTitle>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
              {['프로필 수정', '정산 계좌 관리', '알림 설정', '비밀번호 변경'].map((item) => (
                <button key={item} className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                  <span className="text-sm text-linkit-indigo font-bold">{item}</span>
                  <span className="text-gray-400 text-sm">›</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate('/semi-dealer')}
              className="mt-4 w-full py-3 rounded-pill text-sm font-bold text-red-400 border border-red-100 hover:bg-red-50 transition"
            >
              로그아웃
            </button>
          </>
        )}
      </div>

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-2 z-50 shadow-up">
        {[
          { label: '홈', icon: '🏠' },
          { label: '소개링크', icon: '🔗', hide: role === 'consumer' },
          { label: '주문', icon: '📦' },
          { label: '고객', icon: '👥', hide: role !== 'official' },
          { label: '설정', icon: '⚙️' },
        ].filter(n => !n.hide).map((n) => (
          <button
            key={n.label}
            onClick={() => setTab(n.label)}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 transition ${
              tab === n.label ? 'text-linkit-blue' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className="text-lg">{n.icon}</span>
            <span className="text-[10px] font-bold">{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

/* ─── 서브 컴포넌트 ─── */
function StatCard({ label, value, color, accent }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border p-4 ${accent ? 'border-linkit-green/30' : 'border-gray-100'}`}>
      <p className="text-[10px] text-gray-400 mb-1">{label}</p>
      <p className={`text-lg font-extrabold ${color}`}>{value}</p>
    </div>
  )
}

function SectionTitle({ children }) {
  return <h2 className="text-sm font-extrabold text-linkit-indigo mb-3">{children}</h2>
}

function RoleBadge({ role }) {
  const map = {
    official:   { label: '정식 딜러',   cls: 'bg-linkit-blue text-white' },
    introducer: { label: '소개자',       cls: 'bg-linkit-sky text-white' },
    consumer:   { label: '소비자',       cls: 'bg-gray-500 text-white' },
  }
  const m = map[role]
  return <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${m.cls}`}>{m.label}</span>
}
