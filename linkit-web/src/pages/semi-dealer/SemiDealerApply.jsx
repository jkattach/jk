import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'

const REGIONS = [
  '서울', '경기', '인천', '강원', '충북', '충남', '대전', '세종',
  '전북', '전남', '광주', '경북', '경남', '대구', '부산', '울산', '제주',
]

const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-orange-400 bg-gray-50 placeholder:text-gray-300 text-gray-800'

function Field({ label, required, hint, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[13px] font-bold text-gray-800">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {hint && <span className="text-[11px] text-gray-400">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

export default function SemiDealerApply() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '',
    passwordConfirm: '',
    region: '',
    nickname: '',
    note: '',
  })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = '이름을 입력해 주세요.'
    if (!form.phone.trim()) errs.phone = '전화번호를 입력해 주세요.'
    if (!form.password) errs.password = '비밀번호를 입력해 주세요.'
    else if (form.password.length < 6) errs.password = '6자리 이상 입력해 주세요.'
    if (form.password !== form.passwordConfirm) errs.passwordConfirm = '비밀번호가 일치하지 않습니다.'
    if (!form.region) errs.region = '지역을 선택해 주세요.'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    const existing = JSON.parse(localStorage.getItem('sd_users') || '[]')
    if (existing.find(u => u.phone === form.phone)) {
      setErrors({ phone: '이미 가입 신청된 전화번호입니다.' })
      return
    }
    existing.push({
      name: form.name,
      phone: form.phone,
      password: form.password,
      region: form.region,
      nickname: form.nickname,
      joinedAt: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace('.', ''),
    })
    localStorage.setItem('sd_users', JSON.stringify(existing))
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-white text-3xl mb-5 shadow-lg">
          ✓
        </div>
        <h2 className="text-[22px] font-extrabold text-gray-900 mb-2">신청 완료!</h2>
        <p className="text-[14px] text-gray-500 leading-relaxed mb-8">
          가입 신청이 접수되었습니다.<br/>
          검토 후 담당자가 연락드립니다.
        </p>
        <button
          onClick={() => navigate('/semi-dealer')}
          className="bg-orange-500 text-white font-extrabold px-8 py-3.5 rounded-xl text-[15px]"
        >
          로그인 페이지로 이동
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <PageHeader title="가입 신청" showBack />

      <div className="px-4 pt-5">
        <div className="bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3 mb-5 flex items-start gap-2.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-orange-400 flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p className="text-[12px] text-orange-700 leading-relaxed">
            신청서 검토 후 담당자가 개별 연락드립니다.<br/>
            승인 완료 시 로그인이 활성화됩니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">

          <Field label="이름" required>
            <input name="name" value={form.name} onChange={handleChange} placeholder="홍길동" className={inputCls}/>
            {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
          </Field>

          <Field label="전화번호" required>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="010-0000-0000" inputMode="tel" className={inputCls}/>
            {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
          </Field>

          <Field label="비밀번호" required hint="6자리 이상">
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="비밀번호 입력" className={inputCls}/>
            {errors.password && <p className="text-[11px] text-red-500 mt-1">{errors.password}</p>}
          </Field>

          <Field label="비밀번호 확인" required>
            <input name="passwordConfirm" type="password" value={form.passwordConfirm} onChange={handleChange} placeholder="비밀번호 재입력" className={inputCls}/>
            {errors.passwordConfirm && <p className="text-[11px] text-red-500 mt-1">{errors.passwordConfirm}</p>}
          </Field>

          <Field label="활동 지역" required>
            <select name="region" value={form.region} onChange={handleChange} className={inputCls}>
              <option value="">선택하세요</option>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            {errors.region && <p className="text-[11px] text-red-500 mt-1">{errors.region}</p>}
          </Field>

          <Field label="별명" hint="선택">
            <input name="nickname" value={form.nickname} onChange={handleChange} placeholder="예: 현장왕, 굴삭기달인" className={inputCls}/>
          </Field>

          <Field label="메모" hint="선택">
            <textarea name="note" value={form.note} onChange={handleChange} rows={3} placeholder="추가 문의사항이 있으면 적어주세요" className={inputCls + ' resize-none'}/>
          </Field>

          <button type="submit" className="w-full bg-orange-500 text-white font-extrabold py-4 rounded-xl text-[15px] mt-1">
            가입 신청하기
          </button>
        </form>

        <button
          onClick={() => navigate('/semi-dealer')}
          className="w-full mt-3 py-3 text-[13px] text-gray-400 font-medium"
        >
          이미 계정이 있으신가요? 로그인
        </button>
      </div>
    </div>
  )
}
