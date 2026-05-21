import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const ROLE_META = {
  official: { label: '정식 딜러', color: 'bg-linkit-blue', desc: '계약 후 도매가 공급 · 월정산' },
  introducer: { label: '소개자 · 비공식 총판', color: 'bg-linkit-sky', desc: '소개 링크 · 건당 수수료' },
  consumer: { label: '소비자', color: 'bg-gray-500', desc: '주문 이력 · A/S 관리' },
}

export default function SemiDealerApply() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const role = params.get('role') || 'introducer'
  const meta = ROLE_META[role] || ROLE_META.introducer

  const [form, setForm] = useState({ name: '', phone: '', region: '', company: '', bizNo: '', device: '', note: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: supabase insert
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-linkit-green flex items-center justify-center text-white text-2xl mb-5">✓</div>
        <h2 className="text-xl font-extrabold text-linkit-indigo mb-2">신청이 완료되었습니다</h2>
        <p className="text-gray-500 text-sm mb-6">
          {role === 'introducer' ? '즉시 승인됩니다. 대시보드에서 소개 링크를 확인하세요.' : '담당자가 영업일 3~5일 내 연락드립니다.'}
        </p>
        <button
          onClick={() => navigate('/semi-dealer/dashboard')}
          className="bg-linkit-blue text-white font-bold px-8 py-3 rounded-pill text-sm hover:opacity-90 transition"
        >
          대시보드로 이동
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-linkit-indigo text-white py-3 px-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-linkit-sky text-sm">← 뒤로</button>
        <span className="text-linkit-green font-extrabold">LINKIT</span>
        <span className="text-xs text-gray-300">파트너 신청</span>
      </header>

      <div className="max-w-lg mx-auto px-4 py-10">
        <div className={`inline-block text-xs font-bold text-white px-3 py-1 rounded-full mb-3 ${meta.color}`}>
          {meta.label}
        </div>
        <h1 className="text-xl font-extrabold text-linkit-indigo mb-1">파트너 신청서</h1>
        <p className="text-gray-500 text-sm mb-8">{meta.desc}</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          {/* 공통 필드 */}
          <Field label="이름" required>
            <input name="name" value={form.name} onChange={handleChange} required placeholder="홍길동" className={inputCls} />
          </Field>
          <Field label="연락처" required>
            <input name="phone" value={form.phone} onChange={handleChange} required placeholder="010-0000-0000" className={inputCls} />
          </Field>
          <Field label="지역" required>
            <select name="region" value={form.region} onChange={handleChange} required className={inputCls}>
              <option value="">선택</option>
              {['서울', '경기', '인천', '강원', '충북', '충남', '대전', '세종', '전북', '전남', '광주', '경북', '경남', '대구', '부산', '울산', '제주'].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </Field>

          {/* 딜러 전용 */}
          {role === 'official' && (
            <>
              <Field label="회사명" required>
                <input name="company" value={form.company} onChange={handleChange} required placeholder="(주)링크잇파트너" className={inputCls} />
              </Field>
              <Field label="사업자번호">
                <input name="bizNo" value={form.bizNo} onChange={handleChange} placeholder="000-00-00000" className={inputCls} />
              </Field>
            </>
          )}

          {/* 소비자/소개자 공통 */}
          {role !== 'official' && (
            <Field label="사용 장비">
              <input name="device" value={form.device} onChange={handleChange} placeholder="예: 6W 미니포크레인" className={inputCls} />
            </Field>
          )}

          <Field label="추가 메모">
            <textarea name="note" value={form.note} onChange={handleChange} rows={3} placeholder="궁금한 점이나 특이사항을 적어주세요" className={inputCls + ' resize-none'} />
          </Field>

          <button type="submit" className="w-full bg-linkit-blue text-white font-bold py-3 rounded-pill text-sm hover:opacity-90 transition mt-2">
            신청 완료
          </button>
        </form>
      </div>
    </div>
  )
}

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-linkit-sky text-gray-800 bg-gray-50'

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-linkit-indigo mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  )
}
