import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function SemiDealerLanding() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.phone || !form.password) {
      setError('전화번호와 비밀번호를 입력해 주세요.')
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    setLoading(false)
    const users = JSON.parse(localStorage.getItem('sd_users') || '[]')
    const SEED = [{ name: '테스트', phone: '010-0000-0000', password: '123456', region: '서울', nickname: '', joinedAt: '2025.01.01' }]
    const all = [...SEED, ...users]
    const user = all.find(u => u.phone === form.phone && u.password === form.password)
    if (!user) {
      setError('전화번호 또는 비밀번호가 올바르지 않습니다.')
      return
    }
    localStorage.setItem('sd_session', JSON.stringify(user))
    navigate('/semi-dealer/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">

      {/* 로고 */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mb-3 shadow-md">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="white"/>
          </svg>
        </div>
        <h1 className="text-[22px] font-extrabold text-gray-900 tracking-tight">링크잇</h1>
        <p className="text-[13px] text-gray-400 mt-1">파트너 전용 포털</p>
      </div>

      {/* 로그인 폼 */}
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">전화번호</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="010-0000-0000"
              inputMode="tel"
              autoComplete="tel"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-orange-400 bg-gray-50 placeholder:text-gray-300"
            />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">비밀번호</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="비밀번호 입력"
              autoComplete="current-password"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-orange-400 bg-gray-50 placeholder:text-gray-300"
            />
          </div>

          {error && (
            <p className="text-[12px] text-red-500 font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white font-extrabold py-3.5 rounded-xl text-[15px] disabled:opacity-60 transition"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* 하단 링크 */}
        <div className="flex items-center justify-center gap-4 mt-5">
          <Link to="/semi-dealer/apply" className="text-[13px] text-gray-500 font-medium">
            가입 신청
          </Link>
          <span className="w-px h-3 bg-gray-300"/>
          <button className="text-[13px] text-gray-500 font-medium">
            비밀번호 찾기
          </button>
        </div>

        <p className="text-center text-[11px] text-gray-300 mt-8">
          링크잇 파트너 전용 서비스입니다
        </p>
      </div>
    </div>
  )
}
