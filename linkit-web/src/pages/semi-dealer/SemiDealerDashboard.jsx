import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const MOCK_ORDERS = [
  { id: 'LK-0934', product: '틸트로테이터 TR-5000', amount: '980,000', status: '배송완료', date: '2025.05.18' },
  { id: 'LK-0912', product: '회전링크 RL-300',      amount: '420,000', status: '처리중',   date: '2025.05.14' },
  { id: 'LK-0891', product: '레벨기 LV-200',        amount: '310,000', status: '접수대기', date: '2025.05.10' },
]

const MOCK_LINKS = [
  { code: 'KH-2934', label: '틸트로테이터 메인 링크', clicks: 34, conversions: 2 },
  { code: 'KH-2935', label: '회전링크 이벤트 링크',   clicks: 18, conversions: 1 },
]

const STATUS_STYLE = {
  '배송완료': 'bg-green-50 text-green-700',
  '처리중':   'bg-blue-50 text-blue-700',
  '접수대기': 'bg-orange-50 text-orange-600',
}

const NAV = [
  { label: '홈',    Icon: HomeIcon },
  { label: '소개링크', Icon: LinkIcon },
  { label: '주문',  Icon: BoxIcon },
  { label: '설정',  Icon: SettingsIcon },
]

export default function SemiDealerDashboard() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('홈')
  const [copied, setCopied] = useState(null)
  const [user, setUser] = useState({ name: '', joinedAt: '' })

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('sd_session') || 'null')
    if (!session) {
      navigate('/semi-dealer', { replace: true })
      return
    }
    setUser({ name: session.name, joinedAt: session.joinedAt })
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('sd_session')
    navigate('/semi-dealer')
  }

  const handleCopy = (code) => {
    navigator.clipboard.writeText(`https://linkit.kr/ref/${code}`)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="white"/>
              </svg>
            </div>
            <span className="text-[16px] font-extrabold text-gray-900">링크잇</span>
            <span className="text-[10px] bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded-full">파트너</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-[12px] text-gray-400 font-medium border border-gray-200 rounded-lg px-3 py-1"
          >
            로그아웃
          </button>
        </div>

        {/* 탭 바 */}
        <div className="flex border-t border-gray-100">
          {NAV.map(n => (
            <button
              key={n.label}
              onClick={() => setTab(n.label)}
              className={`flex-1 py-2.5 text-[12px] font-bold border-b-2 transition ${
                tab === n.label
                  ? 'border-orange-500 text-orange-500'
                  : 'border-transparent text-gray-400'
              }`}
            >
              {n.label}
            </button>
          ))}
        </div>
      </header>

      <div className="px-4 py-4">

        {/* 홈 탭 */}
        {tab === '홈' && (
          <div className="space-y-4">
            {/* 프로필 카드 */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-400 text-white rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-extrabold text-xl flex-shrink-0">
                {user.name?.[0] ?? ''}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-[16px]">{user.name} 님</p>
                <p className="text-[11px] text-orange-100">파트너 · {user.joinedAt} 가입</p>
              </div>
            </div>

            {/* 통계 카드 */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="이번 달 소개" value="9건" color="text-orange-500" />
              <StatCard label="누적 소개" value="38건" color="text-gray-900" />
            </div>

            {/* 최근 주문 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[14px] font-bold text-gray-900">최근 주문</h3>
                <button onClick={() => setTab('주문')} className="text-[12px] text-orange-500 font-medium">전체보기</button>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {MOCK_ORDERS.slice(0, 3).map((o, i) => (
                  <div key={o.id} className={`px-4 py-3 flex items-center gap-3 ${i < 2 ? 'border-b border-gray-50' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-gray-900 truncate">{o.product}</p>
                      <p className="text-[11px] text-gray-400">{o.id} · {o.date}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_STYLE[o.status]}`}>
                      {o.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 소개 링크 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[14px] font-bold text-gray-900">내 소개 링크</h3>
                <button onClick={() => setTab('소개링크')} className="text-[12px] text-orange-500 font-medium">전체보기</button>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {MOCK_LINKS.map((l, i) => (
                  <div key={l.code} className={`px-4 py-3 flex items-center gap-3 ${i < MOCK_LINKS.length - 1 ? 'border-b border-gray-50' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-gray-900 truncate">{l.label}</p>
                      <p className="text-[11px] text-gray-400">클릭 {l.clicks} · 전환 {l.conversions}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(l.code)}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-full flex-shrink-0 transition ${
                        copied === l.code ? 'bg-green-100 text-green-700' : 'bg-orange-500 text-white'
                      }`}
                    >
                      {copied === l.code ? '복사됨 ✓' : '복사'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 소개링크 탭 */}
        {tab === '소개링크' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-gray-900">소개 링크 관리</h2>
              <button className="text-[12px] bg-orange-500 text-white font-bold px-4 py-1.5 rounded-full">
                + 새 링크
              </button>
            </div>
            {MOCK_LINKS.map(l => (
              <div key={l.code} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-[14px] font-bold text-gray-900">{l.label}</p>
                    <p className="text-[11px] text-gray-400 font-mono mt-0.5">linkit.kr/ref/{l.code}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(l.code)}
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-full flex-shrink-0 transition ${
                      copied === l.code ? 'bg-green-100 text-green-700' : 'bg-orange-500 text-white'
                    }`}
                  >
                    {copied === l.code ? '복사됨 ✓' : '링크 복사'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: '클릭', value: l.clicks, color: 'text-gray-900' },
                    { label: '전환', value: l.conversions, color: 'text-orange-500' },
                  ].map(m => (
                    <div key={m.label} className="bg-gray-50 rounded-xl py-2.5 text-center">
                      <p className={`text-[15px] font-extrabold ${m.color}`}>{m.value}</p>
                      <p className="text-[10px] text-gray-400">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 주문 탭 */}
        {tab === '주문' && (
          <div className="space-y-2">
            <h2 className="text-[16px] font-bold text-gray-900 mb-3">주문 목록</h2>
            {MOCK_ORDERS.map(o => (
              <div key={o.id} className="bg-white rounded-2xl border border-gray-100 px-4 py-4">
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <p className="text-[14px] font-bold text-gray-900">{o.product}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_STYLE[o.status]}`}>
                    {o.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[12px] text-gray-400">
                  <span>{o.id} · {o.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 설정 탭 */}
        {tab === '설정' && (
          <div className="space-y-3">
            <h2 className="text-[16px] font-bold text-gray-900 mb-3">계정 설정</h2>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-extrabold text-xl">
                {user.name?.[0] ?? ''}
              </div>
              <div>
                <p className="text-[15px] font-bold text-gray-900">{user.name}</p>
                <p className="text-[12px] text-gray-400">파트너 · {user.joinedAt} 가입</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {['프로필 수정', '정산 계좌 관리', '알림 설정', '비밀번호 변경'].map((item, i, arr) => (
                <button key={item} className={`w-full text-left px-4 py-3.5 flex items-center justify-between active:bg-gray-50 ${i < arr.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <span className="text-[14px] text-gray-800 font-medium">{item}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-300">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              ))}
            </div>
            <button
              onClick={handleLogout}
              className="w-full py-3.5 rounded-xl text-[14px] font-bold text-red-400 border border-red-100 bg-white"
            >
              로그아웃
            </button>
          </div>
        )}
      </div>

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 z-50" style={{ height: 72 }}>
        <div className="flex h-full">
          {NAV.map(({ label, Icon }) => (
            <button
              key={label}
              onClick={() => setTab(label)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${tab === label ? 'text-orange-500' : 'text-gray-400'}`}
            >
              <Icon active={tab === label} />
              <span className={`text-[10px] font-medium ${tab === label ? 'text-orange-500' : 'text-gray-400'}`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
      <p className={`text-[17px] font-extrabold ${color}`}>{value}</p>
      <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
    </div>
  )
}

function HomeIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z"
        stroke={active ? '#F97316' : '#9CA3AF'} strokeWidth="1.8" fill={active ? '#FFF7ED' : 'none'} strokeLinejoin="round"/>
    </svg>
  )
}
function LinkIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.047 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.33394 21.9434 7.02296C21.932 5.71198 21.4061 4.45791 20.4791 3.53087C19.5521 2.60383 18.298 2.07799 16.987 2.0666C15.676 2.0552 14.413 2.55918 13.47 3.46997L11.75 5.17997" stroke={active ? '#F97316' : '#9CA3AF'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 11C13.5705 10.4259 13.0226 9.95088 12.3934 9.60708C11.7642 9.26327 11.0684 9.05885 10.3533 9.00763C9.63816 8.9564 8.92037 9.05961 8.24861 9.31018C7.57685 9.56074 6.96684 9.95293 6.45996 10.46L3.45996 13.46C2.54917 14.403 2.04519 15.666 2.05659 16.977C2.06798 18.288 2.59382 19.5421 3.52086 20.4691C4.4479 21.3961 5.70197 21.922 7.01295 21.9334C8.32393 21.9448 9.58694 21.4408 10.53 20.53L12.24 18.82" stroke={active ? '#F97316' : '#9CA3AF'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function BoxIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M21 10H3M16 2L12 10L8 2M5 10L3 20H21L19 10H5Z" stroke={active ? '#F97316' : '#9CA3AF'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill={active ? '#FFF7ED' : 'none'}/>
    </svg>
  )
}
function SettingsIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15Z" stroke={active ? '#F97316' : '#9CA3AF'} strokeWidth="1.8" fill={active ? '#FFF7ED' : 'none'}/>
      <path d="M19.4 15C19.2 15.5 19.1 16.1 19.4 16.6L20.3 18.1C20.5 18.4 20.4 18.8 20.1 19L18.4 20C18.2 20.2 17.8 20.1 17.6 19.8L16.7 18.3C16.4 17.8 15.9 17.5 15.3 17.5C14.7 17.5 14.2 17.8 13.9 18.3L13 19.8C12.8 20.1 12.4 20.2 12.1 20L10.4 19C10.1 18.8 10 18.4 10.2 18.1L11.1 16.6C11.4 16.1 11.3 15.5 11.1 15C10.9 14.5 10.4 14.1 9.9 14H8.1C7.7 14 7.4 13.7 7.4 13.3V11.6C7.4 11.2 7.7 10.9 8.1 10.9H9.9C10.4 10.9 10.9 10.5 11.1 10C11.3 9.5 11.4 8.9 11.1 8.4L10.2 6.9C10 6.6 10.1 6.2 10.4 6L12.1 5C12.4 4.8 12.8 4.9 13 5.2L13.9 6.7C14.2 7.2 14.7 7.5 15.3 7.5C15.9 7.5 16.4 7.2 16.7 6.7L17.6 5.2C17.8 4.9 18.2 4.8 18.5 5L20.2 6C20.5 6.2 20.6 6.6 20.4 6.9L19.5 8.4C19.2 8.9 19.3 9.5 19.5 10C19.7 10.5 20.2 10.9 20.7 10.9H22.5C22.9 10.9 23.2 11.2 23.2 11.6V13.3C23.2 13.7 22.9 14 22.5 14H20.7C20.1 14 19.6 14.4 19.4 15Z" stroke={active ? '#F97316' : '#9CA3AF'} strokeWidth="1.8" fill={active ? '#FFF7ED' : 'none'}/>
    </svg>
  )
}
