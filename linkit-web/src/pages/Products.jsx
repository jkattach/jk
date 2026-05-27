import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import ProductCard from '../components/ProductCard'

const CATS = [
  { id: 'all', label: '전체' },
  { id: 'tilt', label: '틸트로테이터' },
  { id: 'link', label: '회전링크' },
  { id: 'level', label: '레벨기' },
  { id: 'attach', label: '어태치먼트' },
  { id: 'valve', label: '진동밸브' },
]

const ALL_PRODUCTS = [
  { id: 1, cat: 'tilt', name: '틸트로테이터 TR-5000', category: '틸트로테이터', price: '3,200,000원', originalPrice: '3,800,000원', discount: 16 },
  { id: 2, cat: 'tilt', name: '틸트로테이터 TR-3000', category: '틸트로테이터', price: '2,500,000원', originalPrice: '2,900,000원', discount: 14 },
  { id: 3, cat: 'tilt', name: '틸트로테이터 TR-1500 (소형)', category: '틸트로테이터', price: '1,800,000원' },
  { id: 4, cat: 'link', name: '회전링크 RL-300', category: '회전링크', price: '880,000원', originalPrice: '1,100,000원', discount: 20 },
  { id: 5, cat: 'link', name: '회전링크 RL-200', category: '회전링크', price: '650,000원' },
  { id: 6, cat: 'link', name: '회전링크 RL-100 (경량형)', category: '회전링크', price: '420,000원' },
  { id: 7, cat: 'level', name: '레벨기 LV-200', category: '레벨기', price: '1,450,000원', originalPrice: '1,700,000원', discount: 15 },
  { id: 8, cat: 'level', name: '레벨기 LV-100', category: '레벨기', price: '980,000원' },
  { id: 9, cat: 'attach', name: '퀵히치 QH-100', category: '어태치먼트', price: '550,000원', originalPrice: '610,000원', discount: 10 },
  { id: 10, cat: 'attach', name: '버킷링크 BL-200', category: '어태치먼트', price: '320,000원' },
  { id: 11, cat: 'attach', name: '그래플 GP-300', category: '어태치먼트', price: '1,200,000원' },
  { id: 12, cat: 'valve', name: '진동밸브 VV-500', category: '진동밸브', price: '750,000원', originalPrice: '890,000원', discount: 16 },
  { id: 13, cat: 'valve', name: '진동밸브 VV-300', category: '진동밸브', price: '520,000원' },
]

export default function Products() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const initialCat = searchParams.get('cat') || 'all'
  const [activeCat, setActiveCat] = useState(initialCat)

  const filtered = ALL_PRODUCTS.filter(p => {
    const matchCat = activeCat === 'all' || p.cat === activeCat
    const matchSearch = !search || p.name.includes(search) || p.category.includes(search)
    return matchCat && matchSearch
  })

  return (
    <div className="page-content">
      <PageHeader title="취급제품" showBell />

      {/* Search */}
      <div className="bg-white px-4 py-3">
        <div className="flex items-center bg-gray-100 rounded-xl px-3 gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-400 flex-shrink-0">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="제품명, 카테고리 검색"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent py-2.5 text-[14px] text-gray-800 placeholder-gray-400 outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-gray-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-14 z-30">
        <div className="flex overflow-x-auto scroll-hide px-4 gap-1 py-2">
          {CATS.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                activeCat === c.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product List */}
      <div className="p-4 flex flex-col gap-3 bg-gray-50">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mx-auto mb-3 text-gray-300">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p className="text-[14px]">검색 결과가 없습니다</p>
          </div>
        ) : (
          filtered.map(p => <ProductCard key={p.id} {...p} />)
        )}
      </div>
    </div>
  )
}
