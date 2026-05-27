import { NavLink } from 'react-router-dom'

const tabs = [
  {
    to: '/',
    label: '홈',
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z"
          stroke={active ? '#F97316' : '#9CA3AF'} strokeWidth="1.8" fill={active ? '#FFF7ED' : 'none'} strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    to: '/products',
    label: '취급제품',
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="6" width="18" height="15" rx="2" stroke={active ? '#F97316' : '#9CA3AF'} strokeWidth="1.8" fill={active ? '#FFF7ED' : 'none'}/>
        <path d="M3 10H21" stroke={active ? '#F97316' : '#9CA3AF'} strokeWidth="1.8"/>
        <path d="M8 6V4C8 3.45 8.45 3 9 3H15C15.55 3 16 3.45 16 4V6" stroke={active ? '#F97316' : '#9CA3AF'} strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M9 14.5H15M9 17.5H13" stroke={active ? '#F97316' : '#9CA3AF'} strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    to: '/used',
    label: '중고제품',
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M20 12C20 16.42 16.42 20 12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4"
          stroke={active ? '#F97316' : '#9CA3AF'} strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M16 4H20V8" stroke={active ? '#F97316' : '#9CA3AF'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20 4L14 10" stroke={active ? '#F97316' : '#9CA3AF'} strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="3" stroke={active ? '#F97316' : '#9CA3AF'} strokeWidth="1.8" fill={active ? '#FFF7ED' : 'none'}/>
      </svg>
    ),
  },
  {
    to: '/service',
    label: '서비스접수',
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M14.7 6.3C14.1 5.7 13.3 5.3 12.4 5.3C10.5 5.3 9 6.9 9 8.8C9 9.7 9.3 10.5 9.9 11.1L14.7 6.3Z"
          fill={active ? '#FFF7ED' : 'none'} stroke={active ? '#F97316' : '#9CA3AF'} strokeWidth="1.6"/>
        <path d="M14.7 6.3L19.5 1.5L22.5 4.5L17.7 9.3M14.7 6.3L9.9 11.1L2 19L5 22L13 14.1L17.7 9.3M17.7 9.3L14.7 6.3"
          stroke={active ? '#F97316' : '#9CA3AF'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 20H21" stroke={active ? '#F97316' : '#9CA3AF'} strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    to: '/my',
    label: '마이페이지',
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke={active ? '#F97316' : '#9CA3AF'} strokeWidth="1.8" fill={active ? '#FFF7ED' : 'none'}/>
        <path d="M4 20C4 17.24 7.58 15 12 15C16.42 15 20 17.24 20 20"
          stroke={active ? '#F97316' : '#9CA3AF'} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 z-50" style={{ height: 72 }}>
      <div className="flex h-full">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${isActive ? 'text-orange-500' : 'text-gray-400'}`
            }
          >
            {({ isActive }) => (
              <>
                {tab.icon(isActive)}
                <span className={`text-[10px] font-medium ${isActive ? 'text-orange-500' : 'text-gray-400'}`}>
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
