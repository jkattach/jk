import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'

const newProducts = [
  { id: 1, name: '틸트로테이터 TR-5000', category: '틸트로테이터', price: '3,200,000원', originalPrice: '3,800,000원', discount: 16 },
  { id: 2, name: '회전링크 RL-300', category: '회전링크', price: '880,000원', originalPrice: '1,100,000원', discount: 20 },
  { id: 3, name: '레벨기 LV-200', category: '레벨기', price: '1,450,000원', originalPrice: '1,700,000원', discount: 15 },
  { id: 4, name: '퀵히치 QH-100', category: '어태치먼트', price: '550,000원', discount: 10, originalPrice: '610,000원' },
]

const categories = [
  { id: 'tilt', label: '틸트로테이터', emoji: '🔄', to: '/products?cat=tilt' },
  { id: 'link', label: '회전링크', emoji: '🔗', to: '/products?cat=link' },
  { id: 'level', label: '레벨기', emoji: '📐', to: '/products?cat=level' },
  { id: 'attach', label: '어태치먼트', emoji: '🔩', to: '/products?cat=attach' },
  { id: 'valve', label: '진동밸브', emoji: '⚙️', to: '/products?cat=valve' },
]

const usedProducts = [
  { id: 1, name: '중고 틸트로테이터 TR-3000 (A급)', category: '틸트로테이터', price: '1,800,000원' },
  { id: 2, name: '중고 회전링크 RL-200 (B급)', category: '회전링크', price: '450,000원' },
]

export default function Home() {
  return (
    <div className="page-content">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white flex items-center justify-between px-4 h-14 border-b border-gray-100">
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="white" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-[18px] font-extrabold text-gray-900 tracking-tight">링크잇</span>
        </div>
        <Link to="/notifications" className="p-1 text-gray-700 relative">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13.73 21C13.55 21.3 13.3 21.55 13 21.73C12.7 21.9 12.36 22 12 22C11.64 22 11.3 21.9 11 21.73C10.7 21.55 10.45 21.3 10.27 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full"/>
        </Link>
      </header>

      {/* Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-400 mx-4 mt-4 rounded-2xl p-5 flex items-center justify-between overflow-hidden relative">
        <div className="z-10">
          <p className="text-orange-100 text-xs font-medium mb-1">🎉 특별 할인 이벤트</p>
          <h2 className="text-white text-[18px] font-extrabold leading-snug">신제품 및<br/>할인 상품 안내</h2>
          <Link to="/products" className="mt-3 inline-block bg-white text-orange-500 text-[12px] font-bold px-4 py-1.5 rounded-full">
            지금 확인하기
          </Link>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
          <svg width="100" height="100" viewBox="0 0 100 100" fill="white">
            <circle cx="50" cy="50" r="40"/>
            <circle cx="50" cy="50" r="25"/>
          </svg>
        </div>
        <div className="text-5xl z-10">⚙️</div>
      </div>

      {/* 신규 할인 제품 */}
      <section className="mt-5 bg-white pt-4 pb-5">
        <div className="flex items-center justify-between px-4 mb-3">
          <h3 className="text-[16px] font-extrabold text-gray-900">신규 할인제품</h3>
          <Link to="/products" className="text-[12px] text-orange-500 font-medium">더보기 &gt;</Link>
        </div>
        <div className="flex gap-3 overflow-x-auto scroll-hide px-4">
          {newProducts.map(p => (
            <ProductCard key={p.id} {...p} compact />
          ))}
        </div>
      </section>

      {/* 취급제품 카테고리 */}
      <section className="mt-2 bg-white pt-4 pb-5">
        <div className="flex items-center justify-between px-4 mb-3">
          <h3 className="text-[16px] font-extrabold text-gray-900">취급제품</h3>
          <Link to="/products" className="text-[12px] text-orange-500 font-medium">더보기 &gt;</Link>
        </div>
        <div className="grid grid-cols-5 gap-2 px-4">
          {categories.map(cat => (
            <Link key={cat.id} to={cat.to} className="flex flex-col items-center gap-1.5">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-orange-100">
                {cat.emoji}
              </div>
              <span className="text-[10px] text-gray-700 font-medium text-center leading-tight">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 중고제품 */}
      <section className="mt-2 bg-white pt-4 pb-5">
        <div className="flex items-center justify-between px-4 mb-3">
          <h3 className="text-[16px] font-extrabold text-gray-900">중고제품</h3>
          <Link to="/used" className="text-[12px] text-orange-500 font-medium">더보기 &gt;</Link>
        </div>
        <div className="flex flex-col gap-3 px-4">
          {usedProducts.map(p => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      </section>

      {/* 링크잇 소식 배너 */}
      <section className="mt-2 bg-white pt-4 pb-5">
        <div className="flex items-center justify-between px-4 mb-3">
          <h3 className="text-[16px] font-extrabold text-gray-900">링크잇 소식</h3>
          <Link to="/news" className="text-[12px] text-orange-500 font-medium">더보기 &gt;</Link>
        </div>
        <div className="px-4 flex flex-col gap-3">
          {[
            { title: '2025 하반기 신제품 출시 안내', date: '2025.05.20', badge: '공지' },
            { title: '링크잇 서비스센터 이전 안내', date: '2025.05.15', badge: '안내' },
            { title: '틸트로테이터 할인 이벤트 (5월 한정)', date: '2025.05.10', badge: '이벤트' },
          ].map((n, i) => (
            <Link key={i} to="/news" className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                n.badge === '공지' ? 'bg-orange-100 text-orange-600' :
                n.badge === '이벤트' ? 'bg-red-100 text-red-600' :
                'bg-gray-100 text-gray-600'
              }`}>{n.badge}</span>
              <span className="text-[13px] text-gray-800 font-medium flex-1 line-clamp-1">{n.title}</span>
              <span className="text-[11px] text-gray-400 flex-shrink-0">{n.date}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="h-4 bg-gray-50"/>
    </div>
  )
}
