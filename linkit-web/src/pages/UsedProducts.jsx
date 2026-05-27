import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import ProductCard from '../components/ProductCard'

const LINKIT_USED = [
  { id: 1, name: '중고 틸트로테이터 TR-3000 (A급)', category: '틸트로테이터', price: '1,800,000원', badge: 'A급' },
  { id: 2, name: '중고 회전링크 RL-200 (B급)', category: '회전링크', price: '450,000원', badge: 'B급' },
  { id: 3, name: '중고 레벨기 LV-100 (A급)', category: '레벨기', price: '620,000원', badge: 'A급' },
  { id: 4, name: '중고 그래플 GP-300 (B급)', category: '어태치먼트', price: '780,000원', badge: 'B급' },
]

const CUSTOMER_REQUESTS = [
  { id: 1, name: 'TR-5000 또는 동급 틸트로테이터 구합니다', category: '틸트로테이터', price: '구매희망 3,000,000원 이하', request: true },
  { id: 2, name: '진동밸브 중고 구합니다 (상태 무관)', category: '진동밸브', price: '가격 협의', request: true },
  { id: 3, name: '회전링크 RL-300 급구합니다', category: '회전링크', price: '구매희망 700,000원 이하', request: true },
]

function UsedCard({ item, isRequest = false }) {
  return (
    <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex gap-3">
      <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
        {isRequest ? (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-gray-300">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : (
          <img src={`https://placehold.co/96x96/f5f5f5/aaa?text=중고`} alt={item.name} className="w-full h-full object-cover"/>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
            isRequest ? 'bg-blue-100 text-blue-600' :
            item.badge === 'A급' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {isRequest ? '요청' : item.badge}
          </span>
          <span className="text-[11px] text-orange-500 font-medium">{item.category}</span>
        </div>
        <p className="text-[13px] font-semibold text-gray-900 leading-snug line-clamp-2">{item.name}</p>
        <p className="text-[14px] font-bold text-gray-900 mt-1.5">{item.price}</p>
        {!isRequest && (
          <button className="mt-2 text-[11px] text-orange-500 border border-orange-200 px-3 py-1 rounded-full font-medium bg-orange-50">
            문의하기
          </button>
        )}
      </div>
    </div>
  )
}

export default function UsedProducts() {
  const [tab, setTab] = useState('linkit')

  return (
    <div className="page-content">
      <PageHeader title="중고제품" showBell />

      {/* Tabs */}
      <div className="bg-white sticky top-14 z-30 border-b border-gray-100">
        <div className="flex">
          {[
            { id: 'linkit', label: '링크잇 중고제품' },
            { id: 'request', label: '고객요청 중고제품' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 text-[14px] font-semibold transition-colors border-b-2 ${
                tab === t.id
                  ? 'text-orange-500 border-orange-500'
                  : 'text-gray-400 border-transparent'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 bg-gray-50 min-h-[400px]">
        {tab === 'linkit' ? (
          <>
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-orange-500 flex-shrink-0">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p className="text-[12px] text-orange-700">링크잇에서 직접 검수한 중고 제품입니다. 품질을 보증합니다.</p>
            </div>
            {LINKIT_USED.map(item => <UsedCard key={item.id} item={item} />)}
          </>
        ) : (
          <>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-blue-500 flex-shrink-0">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p className="text-[12px] text-blue-700">고객이 구매를 요청한 중고 제품 목록입니다. 보유하신 제품이 있으면 문의해 주세요.</p>
            </div>
            {CUSTOMER_REQUESTS.map(item => <UsedCard key={item.id} item={item} isRequest />)}
            <button className="w-full mt-2 py-3.5 rounded-2xl border-2 border-orange-400 bg-orange-50 text-orange-500 font-bold text-[14px] flex items-center justify-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              판매할 중고제품 등록하기
            </button>
          </>
        )}
      </div>
    </div>
  )
}
