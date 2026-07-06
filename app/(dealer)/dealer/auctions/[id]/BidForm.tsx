'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function BidForm({ requestId, bidderId }: { requestId: string; bidderId: string }) {
  const router = useRouter()
  const [price, setPrice] = useState('')
  const [discountRate, setDiscountRate] = useState('0')
  const [etaDays, setEtaDays] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const supabase = createClient()

    await supabase.from('quote_bids').insert({
      request_id: requestId,
      bidder_id: bidderId,
      bidder_role: 'dealer',
      bid_scope: 'bundle',
      price: parseInt(price.replace(/,/g, ''), 10),
      discount_rate: parseFloat(discountRate),
      eta_days: etaDays ? parseInt(etaDays, 10) : null,
      message: message || null,
    })

    router.push('/dealer/my-bids')
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">입찰 금액 (본체 + 장착 합산)</label>
        <input
          type="number"
          value={price}
          onChange={e => setPrice(e.target.value)}
          required
          min={1}
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          placeholder="예: 12000000"
        />
        {price && (
          <p className="text-xs text-gray-400 mt-1">{parseInt(price || '0', 10).toLocaleString()}원</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">할인율 (%)</label>
          <input
            type="number"
            value={discountRate}
            onChange={e => setDiscountRate(e.target.value)}
            min={0}
            max={30}
            step={0.5}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">납기 (영업일)</label>
          <input
            type="number"
            value={etaDays}
            onChange={e => setEtaDays(e.target.value)}
            min={1}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="예: 7"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">메시지 (선택)</label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
          placeholder="추가 안내사항을 입력하세요"
        />
      </div>

      <button
        type="submit"
        disabled={submitting || !price}
        className="w-full bg-gray-900 text-white rounded-xl py-3 text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors"
      >
        {submitting ? '입찰 중...' : '묶음 입찰 제출'}
      </button>
    </form>
  )
}
