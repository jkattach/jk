import { requireAuth } from '@/lib/auth/rbac'
import { createClient } from '@/lib/supabase/server'
import ApprovalActions from './ApprovalActions'

const ROLE_LABELS: Record<string, string> = {
  dealer: '대리점',
  semi_dealer: '세미딜러',
  installer: '장착자',
}

export default async function ApprovalsPage() {
  await requireAuth(['admin'])
  const supabase = createClient()

  const { data: approvals } = await supabase
    .from('user_approvals')
    .select('*, users!requester_id(email, display_name)')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">파트너 가입 승인 큐</h1>

        {!approvals?.length ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
            대기 중인 신청이 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {approvals.map(a => (
              <div key={a.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {(a.users as { display_name: string; email: string })?.display_name ?? '이름 없음'}
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {(a.users as { display_name: string; email: string })?.email}
                    </div>
                    <div className="mt-1">
                      <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded border border-blue-200">
                        {ROLE_LABELS[a.target_role] ?? a.target_role}
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-lg border ${
                    a.status === 'pending'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : a.status === 'approved'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {a.status === 'pending' ? '검토 대기' : a.status === 'approved' ? '승인됨' : '반려됨'}
                  </span>
                </div>
                {a.docs_url && (
                  <div className="mt-2">
                    <a href={a.docs_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline">
                      서류 확인 →
                    </a>
                  </div>
                )}
                {a.status === 'pending' && (
                  <ApprovalActions approvalId={a.id} userId={a.requester_id} targetRole={a.target_role} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
