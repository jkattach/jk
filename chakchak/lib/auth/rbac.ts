import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type UserRole =
  | 'customer'
  | 'dealer'
  | 'semi_dealer'
  | 'installer'
  | 'internal_staff'
  | 'admin'

export const ROLE_HOME: Record<UserRole, string> = {
  customer: '/',
  dealer: '/dealer/auctions',
  semi_dealer: '/semi/sales',
  installer: '/installer/auctions',
  internal_staff: '/staff/dashboard',
  admin: '/admin/users',
}

export async function requireAuth(allowedRoles?: UserRole[]) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role as UserRole | undefined

  if (!role) {
    redirect('/login')
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    redirect(ROLE_HOME[role] ?? '/')
  }

  return { user, role }
}
