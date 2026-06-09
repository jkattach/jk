import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PartnerSignupForm from './PartnerSignupForm'

export default async function PartnerSignupPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: existing } = await supabase
    .from('user_approvals')
    .select('id, status')
    .eq('requester_id', user.id)
    .maybeSingle()

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">파트너 가입 신청</h1>
          <p className="text-sm text-gray-500 mt-1">
            대리점, 세미딜러, 장착자로 활동하려면 신청서를 제출하세요.
          </p>
        </div>

        {existing ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-sm">
            {existing.status === 'pending' && (
              <p className="text-amber-600">신청이 검토 중입니다. 관리자 승인 후 알림을 드립니다.</p>
            )}
            {existing.status === 'approved' && (
              <p className="text-green-600">신청이 승인되었습니다.</p>
            )}
            {existing.status === 'rejected' && (
              <p className="text-red-600">신청이 반려되었습니다. 사유를 확인하고 다시 신청해 주세요.</p>
            )}
          </div>
        ) : (
          <PartnerSignupForm userId={user.id} />
        )}
      </div>
    </main>
  )
}
