import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'

const menuSections = [
  {
    title: '내 정보',
    items: [
      { to: '/my/profile', label: '회원정보', icon: '👤' },
      { to: '/my/orders', label: '구매내역', icon: '🛒' },
      { to: '/my/sales', label: '판매내역', icon: '💰' },
    ],
  },
  {
    title: '커뮤니티',
    items: [
      { to: '/my/worklog', label: '작업공유', icon: '🏗️' },
      { to: '/news', label: '링크잇 소식', icon: '📰' },
    ],
  },
  {
    title: '설정',
    items: [
      { to: '/service/notifications', label: '알림설정', icon: '🔔' },
      { to: '/my/terms', label: '이용약관', icon: '📄' },
    ],
  },
]

export default function MyPage() {
  return (
    <div className="page-content">
      <PageHeader title="마이페이지" showBell />

      {/* 프로필 */}
      <div className="bg-white px-5 py-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-3xl shadow-sm border-2 border-orange-200">
            👷
          </div>
          <div>
            <p className="text-[18px] font-extrabold text-gray-900">안녕하세요!</p>
            <p className="text-[13px] text-gray-500 mt-0.5">링크잇 회원으로 로그인하시면<br/>더 많은 서비스를 이용할 수 있습니다.</p>
          </div>
        </div>
        <Link to="/login" className="mt-4 block w-full py-3 bg-orange-500 text-white font-bold text-[15px] rounded-xl text-center">
          로그인 / 회원가입
        </Link>
      </div>

      <div className="h-2 bg-gray-100"/>

      {/* 메뉴 */}
      {menuSections.map((section, si) => (
        <div key={si}>
          <div className="bg-white">
            <div className="px-4 pt-4 pb-1">
              <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide">{section.title}</p>
            </div>
            {section.items.map((item, ii) => (
              <Link
                key={ii}
                to={item.to}
                className="flex items-center px-4 py-3.5 border-b border-gray-50 last:border-0 active:bg-gray-50"
              >
                <span className="text-xl mr-3">{item.icon}</span>
                <span className="flex-1 text-[15px] text-gray-800 font-medium">{item.label}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-300">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            ))}
          </div>
          {si < menuSections.length - 1 && <div className="h-2 bg-gray-100"/>}
        </div>
      ))}

      {/* 고객센터 */}
      <div className="h-2 bg-gray-100"/>
      <div className="bg-white px-4 py-4">
        <p className="text-[12px] font-semibold text-gray-400 mb-3">고객센터</p>
        <div className="flex gap-3">
          <a href="tel:01012345678" className="flex-1 py-3 bg-gray-50 rounded-xl text-center text-[13px] font-semibold text-gray-700 flex items-center justify-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 16.92V19.92C22 20.48 21.74 21.01 21.29 21.37C20.84 21.73 20.26 21.88 19.71 21.78C16.67 21.23 13.74 20.14 11.06 18.53C8.57 17.06 6.39 14.88 4.92 12.4C3.3 9.7 2.21 6.75 1.67 3.69C1.57 3.15 1.72 2.57 2.07 2.12C2.42 1.67 2.95 1.41 3.5 1.41H6.5C7.49 1.41 8.33 2.1 8.5 3.08C8.67 4.06 8.96 5.02 9.36 5.93C9.59 6.49 9.44 7.12 9 7.53L7.75 8.78C9.1 11.36 11.21 13.47 13.79 14.82L15.04 13.57C15.45 13.13 16.08 12.98 16.64 13.21C17.55 13.61 18.51 13.9 19.49 14.07C20.48 14.24 21.17 15.1 21.17 16.08L22 16.92Z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            전화문의
          </a>
          <a href="https://open.kakao.com" target="_blank" rel="noreferrer" className="flex-1 py-3 bg-yellow-50 rounded-xl text-center text-[13px] font-semibold text-yellow-700 flex items-center justify-center gap-1.5">
            <span>💬</span> 카카오문의
          </a>
        </div>
      </div>

      {/* 회사 정보 footer */}
      <div className="h-2 bg-gray-100"/>
      <footer className="bg-white px-4 py-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-orange-500 rounded-md flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="white"/>
            </svg>
          </div>
          <span className="text-[15px] font-extrabold text-gray-800">링크잇</span>
        </div>
        <div className="text-[11px] text-gray-400 space-y-1 leading-relaxed">
          <p>상호명: 링크잇 | 대표자: 정우철</p>
          <p>사업자등록번호: 000-00-00000</p>
          <p>문의전화: 010-1234-5678</p>
          <p>이메일: info@linkit.kr</p>
          <p>주소: 경기도 화성시 동탄XXX</p>
        </div>
        <p className="text-[10px] text-gray-300 mt-4">© 2025 링크잇. All rights reserved.</p>
      </footer>
    </div>
  )
}
