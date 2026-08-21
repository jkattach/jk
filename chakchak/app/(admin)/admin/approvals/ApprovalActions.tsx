'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ApprovalActions({
  approvalId,
  userId,
  targetRole,
}: {
  approvalId: string
  userId: string
  targetRole: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const decide = async (decision: 'approved' | 'rejected') => {
    setLoading(true)
    const supabase = createClient()

    await supabase
      .from('user_approvals')
      .update({ status: decision, decided_at: new Date().toISOString() })
      .eq('id', approvalId)

    if (decision === 'approved') {
      await supabase.from('users').update({ role: targetRole }).eq('id', userId)
      await supabase.from('partner_profiles').upsert({ user_id: userId, business_name: '' })
    }

    router.refresh()
  }

  return (
    <div className="mt-3 flex gap-2">
      <button
        onClick={() => decide('approved')}
        disabled={loading}
        className="px-4 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
      >
        승인
      </button>
      <button
        onClick={() => decide('rejected')}
        disabled={loading}
        className="px-4 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
      >
        반려
      </button>
    </div>
  )
}
