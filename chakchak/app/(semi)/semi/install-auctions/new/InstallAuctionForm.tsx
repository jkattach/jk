'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const SIDO_LIST = [
  '서울','부산','대구','인천','광주','대전','울산','세종',
  '경기','강원','충북','충남','전북','전남','경북','경남','제주'
]

export default function InstallAuctionForm({ semiDealerId }: { semiDealerId: string }) {
  const router = useRouter()
  const [attachmentId, setAttachmentId] = useState('')
  const [customerId] = useState('')
  const [regionSido, setRegionSido] = useState('')
  const [regionSigungu, setRegionSigungu] = useState('')
  const [consumerPrice, setConsumerPrice] = useState('')
  const [auctionHours, setAuctionHours] = useState('24')
  const [submitting, setSubmitting] = useState(false)

  const feeRate = parseFloat(process.env.NEXT_PUBLIC_FEE_TRACK_B || '0.05')
  const price = parseInt(consumerPrice || '0', 10)
  const netPrice = Math.floor(price * (1 - feeRate))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const supabase = createClient()

    const hours = parseInt(auctionHours, 10)
    const expiresAt = new Date(Date.now() + hours * 3600 * 1000).toISOString()

    await supabase.from('install_auctions').insert({
      semi_dealer_id: semiDealerId,
      customer_id: customerId || semiDealerId,
      attachment_id: attachmentId,
      region_sido: regionSido,
      region_sigungu: regionSigungu || null,
      consumer_price: price,
      stage: 'pool',
      expires_at: expiresAt,
    })

    router.push('/semi/sales')
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">어태치먼트 ID</label>
        <input
          value={attachmentId}
          onChange={e => setAttachmentId(e.target.value)}
          required
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          placeholder="카탈로그에서 복사한 ID"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">시/도</label>
          <select
            value={regionSido}
            onChange={e => setRegionSido(e.target.value)}
            required
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="">선택</option>
            {SIDO_LIST.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">시/군/구</label>
          <input
            value={regionSigungu}
            onChange={e => setRegionSigungu(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="선택사항"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">소비자가 (장착비 포함)</label>
        <input
          type="number"
          value={consumerPrice}
          onChange={e => setConsumerPrice(e.target.value)}
          required
          min={1}
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          placeholder="예: 1500000"
        />
        {price > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            수수료 5% 차감 후 수령 예정: {netPrice.toLocaleString()}원
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">경매 시간</label>
        <div className="flex gap-2">
          {['24', '48', '72'].map(h => (
            <button
              key={h}
              type="button"
              onClick={() => setAuctionHours(h)}
              className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-colors ${
                auctionHours === h
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {h}시간
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-gray-900 text-white rounded-xl py-3 text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors"
      >
        {submitting ? '발주 중...' : '장착경매 발주'}
      </button>
    </form>
  )
}
