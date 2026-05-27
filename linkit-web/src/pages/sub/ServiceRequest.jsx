import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'

const PRODUCT_TYPES = ['틸트로테이터', '회전링크', '레벨기', '어태치먼트', '진동밸브', '기타']
const ISSUES = ['작동불량', '소음발생', '오일누유', '균열/파손', '점검요청', '기타']

export default function ServiceRequest() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ productType: '', model: '', issue: '', detail: '', phone: '' })

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = () => {
    if (!form.productType || !form.issue || !form.phone) {
      alert('제품종류, 증상, 연락처를 입력해 주세요.')
      return
    }
    alert('서비스 신청이 완료되었습니다!\n담당자가 24시간 이내에 연락드립니다.')
    navigate('/service')
  }

  return (
    <div className="page-content bg-white">
      <PageHeader title="서비스 요청" showBack />

      <div className="px-4 pt-4 space-y-5 pb-6">
        {/* 제품 종류 */}
        <div>
          <label className="block text-[14px] font-bold text-gray-800 mb-2">
            제품 종류 <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {PRODUCT_TYPES.map(t => (
              <button
                key={t}
                onClick={() => set('productType', t)}
                className={`px-3.5 py-2 rounded-lg text-[13px] font-medium border transition-colors ${
                  form.productType === t
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 모델명 */}
        <div>
          <label className="block text-[14px] font-bold text-gray-800 mb-2">모델명 (선택)</label>
          <input
            type="text"
            placeholder="예: TR-5000"
            value={form.model}
            onChange={e => set('model', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-orange-400"
          />
        </div>

        {/* 증상 */}
        <div>
          <label className="block text-[14px] font-bold text-gray-800 mb-2">
            증상 <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {ISSUES.map(t => (
              <button
                key={t}
                onClick={() => set('issue', t)}
                className={`px-3.5 py-2 rounded-lg text-[13px] font-medium border transition-colors ${
                  form.issue === t
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 상세 내용 */}
        <div>
          <label className="block text-[14px] font-bold text-gray-800 mb-2">상세 내용</label>
          <textarea
            rows={4}
            placeholder="증상을 자세히 설명해 주세요."
            value={form.detail}
            onChange={e => set('detail', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-orange-400 resize-none"
          />
        </div>

        {/* 연락처 */}
        <div>
          <label className="block text-[14px] font-bold text-gray-800 mb-2">
            연락처 <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            placeholder="010-0000-0000"
            value={form.phone}
            onChange={e => set('phone', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-orange-400"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-4 bg-orange-500 text-white font-bold text-[16px] rounded-xl"
        >
          서비스 신청하기
        </button>
      </div>
    </div>
  )
}
