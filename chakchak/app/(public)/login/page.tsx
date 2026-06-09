import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROLE_HOME } from '@/lib/auth/rbac'
import type { UserRole } from '@/lib/auth/rbac'
import LoginButtons from './LoginButtons'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    const role = profile?.role as UserRole | undefined
    redirect(role ? ROLE_HOME[role] : '/')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-900 text-white rounded-xl text-xl font-bold mb-4">
            착착
          </div>
          <h1 className="text-xl font-semibold text-gray-900">로그인</h1>
          <p className="text-sm text-gray-500 mt-1">중장비 어태치먼트 역경매 플랫폼</p>
        </div>

        {searchParams.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            로그인 중 오류가 발생했습니다. 다시 시도해 주세요.
          </div>
        )}

        <LoginButtons />
      </div>
    </main>
  )
}
