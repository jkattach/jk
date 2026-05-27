import { useNavigate } from 'react-router-dom'

export default function PageHeader({ title, showBack = false, showBell = false, onBell, rightNode }) {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-40 bg-white flex items-center justify-between px-4 h-14 border-b border-gray-100">
      <div className="flex items-center gap-2">
        {showBack && (
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-gray-700">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        <span className="text-[17px] font-bold text-gray-900">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        {rightNode}
        {showBell && (
          <button onClick={onBell} className="p-1 text-gray-700 relative">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.73 21C13.55 21.3 13.3 21.55 13 21.73C12.7 21.9 12.36 22 12 22C11.64 22 11.3 21.9 11 21.73C10.7 21.55 10.45 21.3 10.27 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
    </header>
  )
}
