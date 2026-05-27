import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'

const menuItems = [
  {
    to: '/service/notifications',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="#FFF7ED"/>
        <path d="M13.73 21C13.55 21.3 13.3 21.55 13 21.73C12.7 21.9 12.36 22 12 22C11.64 22 11.3 21.9 11 21.73C10.7 21.55 10.45 21.3 10.27 21" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: '알림설정',
    desc: '서비스 알림을 설정합니다',
    bg: 'bg-orange-50',
  },
  {
    to: '/service/chat',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M21 15C21 15.55 20.78 16.08 20.37 16.47C19.96 16.86 19.41 17.08 18.83 17.08H7.17L3 21V5.08C3 4.53 3.22 4 3.63 3.61C4.04 3.22 4.59 3 5.17 3H18.83C19.41 3 19.96 3.22 20.37 3.61C20.78 4 21 4.53 21 5.08V15Z" stroke="#3B82F6" strokeWidth="1.8" fill="#EFF6FF" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: '채팅기록',
    desc: '이전 채팅 내역을 확인합니다',
    bg: 'bg-blue-50',
  },
  {
    to: '/service/guide',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M9 11L12 14L22 4" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 12V19C21 19.55 20.78 20.08 20.37 20.47C19.96 20.86 19.41 21.08 18.83 21.08H5.17C4.59 21.08 4.04 20.86 3.63 20.47C3.22 20.08 3 19.55 3 19V5.08C3 4.53 3.22 4 3.63 3.61C4.04 3.22 4.59 3 5.17 3H15" stroke="#10B981" strokeWidth="1.8" fill="#ECFDF5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: '서비스가이드',
    desc: '서비스 이용 안내를 확인합니다',
    bg: 'bg-green-50',
  },
  {
    href: 'https://open.kakao.com/o/linkit',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M12 3C7.03 3 3 6.36 3 10.5C3 13.01 4.44 15.22 6.66 16.62L5.5 21L10.04 18.5C10.67 18.6 11.33 18.65 12 18.65C16.97 18.65 21 15.29 21 11.15" stroke="#FCD34D" strokeWidth="1.8" fill="#FFFBEB" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: '1:1 카카오톡 문의',
    desc: '카카오톡으로 바로 문의하세요',
    bg: 'bg-yellow-50',
  },
]

export default function Service() {
  return (
    <div className="page-content">
      <PageHeader title="서비스접수" showBell />

      {/* 서비스 요청 버튼 */}
      <div className="bg-white px-4 pt-5 pb-6">
        <div className="border-2 border-orange-400 rounded-2xl p-5 bg-orange-50 flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-extrabold text-gray-900 mb-1">서비스 요청하기</h2>
            <p className="text-[13px] text-gray-500 leading-snug">제품 수리 및 점검을<br/>신청할 수 있습니다</p>
          </div>
          <Link
            to="/service/request"
            className="bg-orange-500 text-white font-bold text-[14px] px-5 py-2.5 rounded-xl shadow-sm active:bg-orange-600 transition-colors"
          >
            신청하기
          </Link>
        </div>
      </div>

      {/* 진행중 서비스 */}
      <div className="bg-white px-4 pb-5">
        <h3 className="text-[15px] font-bold text-gray-900 mb-3">진행중인 서비스</h3>
        <div className="bg-gray-50 rounded-2xl p-4 text-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="mx-auto mb-2 text-gray-300">
            <path d="M14.7 6.3C14.1 5.7 13.3 5.3 12.4 5.3C10.5 5.3 9 6.9 9 8.8C9 9.7 9.3 10.5 9.9 11.1L14.7 6.3Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M14.7 6.3L19.5 1.5L22.5 4.5L17.7 9.3M14.7 6.3L9.9 11.1L2 19L5 22L13 14.1L17.7 9.3M17.7 9.3L14.7 6.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <p className="text-[13px] text-gray-400">진행중인 서비스가 없습니다</p>
        </div>
      </div>

      {/* 구분선 */}
      <div className="h-2 bg-gray-100"/>

      {/* 메뉴 그리드 */}
      <div className="bg-white px-4 pt-5 pb-6">
        <h3 className="text-[15px] font-bold text-gray-900 mb-4">서비스 메뉴</h3>
        <div className="grid grid-cols-2 gap-3">
          {menuItems.map((item, i) => {
            const inner = (
              <div className={`${item.bg} rounded-2xl p-4 flex flex-col gap-2.5 border border-gray-100 h-full`}>
                <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  {item.icon}
                </div>
                <div>
                  <p className="text-[15px] font-bold text-gray-900">{item.label}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{item.desc}</p>
                </div>
              </div>
            )
            return item.href ? (
              <a key={i} href={item.href} target="_blank" rel="noreferrer">{inner}</a>
            ) : (
              <Link key={i} to={item.to}>{inner}</Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
