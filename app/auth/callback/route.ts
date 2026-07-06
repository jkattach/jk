import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ROLE_HOME } from '@/lib/auth/rbac'
import type { UserRole } from '@/lib/auth/rbac'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  const supabase = createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  const user = data.user
  const provider = user.app_metadata.provider ?? null

  const { data: existing } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', user.id)
    .maybeSingle()

  if (!existing) {
    await supabase.from('users').insert({
      id: user.id,
      role: 'customer',
      email: user.email,
      oauth_provider: provider,
      display_name: user.user_metadata.full_name ?? user.user_metadata.name ?? null,
    })
    await supabase.from('notification_preferences').insert([
      { user_id: user.id, channel: 'push', priority: 1 },
      { user_id: user.id, channel: 'telegram', priority: 2, enabled: false },
    ])
  }

  const role = (existing?.role ?? 'customer') as UserRole
  const homeUrl = ROLE_HOME[role] ?? '/'

  return NextResponse.redirect(`${origin}${next === '/' ? homeUrl : next}`)
}
