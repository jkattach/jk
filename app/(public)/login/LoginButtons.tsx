'use client'

import { createClient } from '@/lib/supabase/client'

export default function LoginButtons() {
  const supabase = createClient()

  const signIn = async (provider: 'google' | 'kakao') => {
    await supabase.auth.signInWithOAuth({
      provider: provider === 'google' ? 'google' : 'kakao',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => signIn('google')}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        Google로 계속하기
      </button>

      <button
        onClick={() => signIn('kakao')}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#FEE500] text-[#191919] font-medium text-sm hover:bg-[#F5DC00] transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" fill="currentColor">
          <path d="M9 1.5C4.86 1.5 1.5 4.134 1.5 7.383c0 2.07 1.374 3.888 3.441 4.935l-.876 3.27c-.078.291.206.53.462.371L8.7 13.602A8.8 8.8 0 0 0 9 13.617c4.14 0 7.5-2.634 7.5-5.883C16.5 4.134 13.14 1.5 9 1.5z"/>
        </svg>
        카카오로 계속하기
      </button>

      <p className="text-center text-xs text-gray-400 mt-4">
        로그인 시{' '}
        <span className="text-gray-500 underline cursor-pointer">이용약관</span> 및{' '}
        <span className="text-gray-500 underline cursor-pointer">개인정보처리방침</span>에 동의합니다.
      </p>
    </div>
  )
}
