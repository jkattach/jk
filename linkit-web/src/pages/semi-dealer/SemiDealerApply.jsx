import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const ROLE_META = {
  official:   { label: '정식 딜러',       badge: '공식',  desc: '계약 후 도매가 공급 · 월정산' },
  introducer: { label: '세미딜러 (소개자)', badge: '세미',  desc: '소개 링크 · 건당 수수료 · 계약 불필요' },
  consumer:   { label: '소비자 회원',      badge: '회원',  desc: '주문 이력 · A/S 관리' },
}

const REGIONS = ['서울', '경기', '인천', '강원', '충북', '충남', '대전', '세종', '전북', '전남', '광주', '경북', '경남', '대구', '부산', '울산', '제주']

export default function SemiDealerApply() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const role = params.get('role') || 'introducer'
  const meta = ROLE_META[role] || ROLE_META.introducer

  const [form, setForm] = useState({
    name: '', phone: '', region: '',
    company: '', bizNo: '',
    device: '', note: '',
  })
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
        <div className="w-16 h-16 rounded-full bg-brand-orange flex items-center justify-center text-white text-2xl mb-5">
          ✓
        </div>
        <h2 className="text-xl font-extrabold text-brand-dark mb-2">신청 완료!</h2>
        <p className="text-brand-muted text-sm mb-1">
          {role === 'introducer'
            ? '세미딜러로 즉시 승인됩니다.'
            : '담당자가 영업일 3~5일 내 연락드립니다.'}
        </p>
        <p className="text-brand-muted text-sm mb-8">대시보드에서 소개 링크와 실적을 확인하세요.</p>
        <button
          onClick={() => navigate('/semi-dealer/dashboard')}
          className="bg-brand-orange text-white font-extrabold px-8 py-3 rounded-full text-sm hover:bg-orange-600 transition"
        >
          대시보드로 이동
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-8">
      {/* 헤더 */}
      <header className="bg-brand-dark text-white py-3 px-4 flex items-center gap-3 sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="text-stone-400 hover:text-white transition text-sm">
          ← 뒤로
        </button>
        <span className="text-brand-orange font-extrabold">틸로코리아</span>
        <span className="text-[11px] text-stone-400">파트너 신청</span>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8">
        {/* 역할 배지 + 타이틀 */}
        <div className="mb-6">
          <span className="inline-block text-[11px] font-extrabold bg-brand-orange text-white px-3 py-0.5 rounded-full mb-3">
            {meta.badge}
          </span>
          <h1 className="text-xl font-extrabold text-brand-dark mb-1">파트너 신청서</h1>
          <p className="text-sm text-brand-muted">{meta.desc}</p>
        </div>

        {/* 역할 선택 탭 */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {Object.entries(ROLE_META).map(([id, m]) => (
            <button
              key={id}
              onClick={() => navigate(`/semi-dealer/apply?role=${id}`)}
              className={`flex-shrink-0 text-xs font-bold px-4 py-1.5 rounded-full border transition ${
                role === id
                  ? 'bg-brand-orange text-white border-brand-orange'
                  : 'bg-white text-brand-muted border-gray-200 hover:border-brand-orange/50'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <Field label="이름" required>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="홍길동"
              className={inputCls}
            />
          </Field>

          <Field label="연락처" required>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="010-0000-0000"
              inputMode="tel"
              className={inputCls}
            />
          </Field>

          <Field label="지역" required>
            <select name="region" value={form.region} onChange={handleChange} required className={inputCls}>
              <option value="">선택하세요</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </Field>

          {/* 정식 딜러 전용 */}
          {role === 'official' && (
            <>
              <Field label="회사명" required>
                <input
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  required
                  placeholder="(주)예시파트너"
                  className={inputCls}
                />
              </Field>
              <Field label="사업자번호">
                <input
                  name="bizNo"
                  value={form.bizNo}
                  onChange={handleChange}
                  placeholder="000-00-00000"
                  inputMode="numeric"
                  className={inputCls}
                />
              </Field>
            </>
          )}

          {/* 소개자 / 소비자 전용 */}
          {role !== 'official' && (
            <Field label="사용 장비">
              <input
                name="device"
                value={form.device}
                onChange={handleChange}
                placeholder="예: 6W 미니굴착기"
                className={inputCls}
              />
            </Field>
          )}

          <Field label="추가 메모">
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              rows={3}
              placeholder="궁금한 점이나 특이사항을 적어주세요"
              className={inputCls + ' resize-none'}
            />
          </Field>

          <button
            type="submit"
            className="w-full bg-brand-orange text-white font-extrabold py-3.5 rounded-full text-sm hover:bg-orange-600 transition mt-2"
          >
            신청 완료
          </button>
        </form>

        {/* 안내 */}
        <div className="mt-4 bg-brand-light border border-orange-100 rounded-xl p-4">
          <p className="text-[11px] font-bold text-brand-orange mb-1">
            {role === 'introducer' ? '세미딜러 혜택' : role === 'official' ? '정식 딜러 혜택' : '소비자 혜택'}
          </p>
          <ul className="text-[11px] text-brand-muted space-y-0.5">
            {role === 'introducer' && (
              <>
                <li>· 소개 링크 즉시 발급 — 공유만 해도 수익</li>
                <li>· 판매가의 5~8% 건당 수수료</li>
                <li>· 재고·계약 불필요, 앱에서 실적 관리</li>
              </>
            )}
            {role === 'official' && (
              <>
                <li>· 도매 공급가 적용 — 판매 마진 최대화</li>
                <li>· 전담 영업지원 및 제품 교육 제공</li>
                <li>· 매월 정산 (판매가의 10~15%)</li>
              </>
            )}
            {role === 'consumer' && (
              <>
                <li>· 주문 이력 및 A/S 접수 간편 관리</li>
                <li>· 재구매 시 할인 혜택 적용</li>
                <li>· 멤버십 포인트 적립</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

const inputCls =
  'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 text-brand-dark bg-gray-50 placeholder:text-gray-300'

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-brand-dark mb-1.5">
        {label} {required && <span className="text-brand-orange">*</span>}
      </label>
      {children}
    </div>
  )
}
