import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'

const ROLE_META = {
  official:   { label: '정식 딜러',       badge: '정식딜러', badgeColor: 'bg-orange-500 text-white',      desc: '계약 후 도매가 공급 · 월정산 (10~15%)', perks: ['도매 공급가 적용 — 판매 마진 최대화', '전담 영업지원 및 제품 교육 제공', '매월 정산 (판매가의 10~15%)'] },
  introducer: { label: '세미딜러 (소개자)', badge: '세미딜러', badgeColor: 'bg-amber-100 text-amber-700', desc: '소개 링크 · 건당 수수료 · 계약 불필요',      perks: ['소개 링크 즉시 발급 — 공유만 해도 수익', '판매가의 5~8% 건당 수수료', '재고·계약 불필요, 앱에서 실적 관리'] },
  consumer:   { label: '소비자 회원',      badge: '소비자',   badgeColor: 'bg-gray-100 text-gray-600',    desc: '주문 이력 · A/S 접수 간편 관리',            perks: ['주문 이력 및 A/S 접수 간편 관리', '재구매 시 할인 혜택 적용', '멤버십 포인트 적립'] },
}

const REGIONS = ['서울', '경기', '인천', '강원', '충북', '충남', '대전', '세종', '전북', '전남', '광주', '경북', '경남', '대구', '부산', '울산', '제주']

const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-orange-400 bg-gray-50 placeholder:text-gray-300 text-gray-800'

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-[13px] font-bold text-gray-800 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
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
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-white text-3xl mb-5 shadow-lg">
          ✓
        </div>
        <h2 className="text-[22px] font-extrabold text-gray-900 mb-2">신청 완료!</h2>
        <p className="text-[14px] text-gray-500 leading-relaxed mb-1">
          {role === 'introducer'
            ? '세미딜러로 즉시 승인됩니다.'
            : role === 'official'
            ? '담당자가 영업일 3~5일 내 연락드립니다.'
            : '회원가입이 완료되었습니다.'}
        </p>
        <p className="text-[13px] text-gray-400 mb-8">대시보드에서 소개 링크와 실적을 확인하세요.</p>
        <button
          onClick={() => navigate('/semi-dealer/dashboard')}
          className="bg-orange-500 text-white font-extrabold px-8 py-3.5 rounded-xl text-[15px] shadow-md"
        >
          대시보드로 이동
        </button>
        <button
          onClick={() => navigate('/semi-dealer')}
          className="mt-3 text-[13px] text-gray-400 font-medium"
        >
          홈으로 돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <PageHeader title="파트너 신청" showBack />

      <div className="px-4 pt-4">
        {/* 역할 선택 탭 */}
        <div className="flex gap-2 mb-4 overflow-x-auto scroll-hide pb-1">
          {Object.entries(ROLE_META).map(([id, m]) => (
            <button
              key={id}
              onClick={() => navigate(`/semi-dealer/apply?role=${id}`)}
              className={`flex-shrink-0 text-[12px] font-bold px-4 py-2 rounded-full border transition ${
                role === id
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-500 border-gray-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* 역할 배지 + 설명 */}
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-5">
          <span className={`inline-block text-[11px] font-extrabold px-2.5 py-0.5 rounded-full mb-2 ${meta.badgeColor}`}>
            {meta.badge}
          </span>
          <p className="text-[13px] text-orange-700 leading-relaxed mb-2">{meta.desc}</p>
          <ul className="space-y-1">
            {meta.perks.map(p => (
              <li key={p} className="text-[12px] text-orange-600 flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-orange-400 text-white text-[8px] flex items-center justify-center flex-shrink-0 font-bold">✓</span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <Field label="이름" required>
            <input name="name" value={form.name} onChange={handleChange} required placeholder="홍길동" className={inputCls}/>
          </Field>
          <Field label="연락처" required>
            <input name="phone" value={form.phone} onChange={handleChange} required placeholder="010-0000-0000" inputMode="tel" className={inputCls}/>
          </Field>
          <Field label="지역" required>
            <select name="region" value={form.region} onChange={handleChange} required className={inputCls}>
              <option value="">선택하세요</option>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>

          {role === 'official' && (
            <>
              <Field label="회사명" required>
                <input name="company" value={form.company} onChange={handleChange} required placeholder="(주)예시파트너" className={inputCls}/>
              </Field>
              <Field label="사업자번호">
                <input name="bizNo" value={form.bizNo} onChange={handleChange} placeholder="000-00-00000" inputMode="numeric" className={inputCls}/>
              </Field>
            </>
          )}

          {role !== 'official' && (
            <Field label="사용 장비 (선택)">
              <input name="device" value={form.device} onChange={handleChange} placeholder="예: 6W 미니굴착기" className={inputCls}/>
            </Field>
          )}

          <Field label="추가 메모">
            <textarea name="note" value={form.note} onChange={handleChange} rows={3} placeholder="궁금한 점이나 특이사항을 적어주세요" className={inputCls + ' resize-none'}/>
          </Field>

          <button type="submit" className="w-full bg-orange-500 text-white font-extrabold py-4 rounded-xl text-[15px] mt-2">
            신청 완료
          </button>
        </form>
      </div>
    </div>
  )
}
