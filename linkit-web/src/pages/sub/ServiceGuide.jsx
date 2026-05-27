import { useState } from 'react'
import PageHeader from '../../components/PageHeader'

const FAQS = [
  {
    q: '서비스 접수는 어떻게 하나요?',
    a: '서비스접수 탭 → "서비스 요청하기" 버튼을 누르고 제품 정보와 증상을 입력하시면 됩니다. 접수 후 담당자가 24시간 이내에 연락드립니다.',
  },
  {
    q: '수리 기간은 얼마나 걸리나요?',
    a: '일반적으로 부품 수급 상황에 따라 3~7일 정도 소요됩니다. 긴급 수리의 경우 별도 문의해 주세요.',
  },
  {
    q: '보증 기간은 어떻게 되나요?',
    a: '링크잇 정품 제품은 구매일로부터 1년간 무상 A/S를 제공합니다. 소모품 및 외부 충격에 의한 파손은 유상 처리됩니다.',
  },
  {
    q: '중고 제품도 서비스 접수가 가능한가요?',
    a: '네, 중고 제품도 유상으로 서비스 접수가 가능합니다. 단, 제품 모델명과 구매 경로를 확인해 주세요.',
  },
  {
    q: '출장 서비스도 제공하나요?',
    a: '경기 남부 지역에 한해 출장 서비스를 제공합니다. 출장비는 별도로 청구되며, 자세한 내용은 고객센터로 문의해 주세요.',
  },
  {
    q: '부품 구매만도 가능한가요?',
    a: '네, 서비스 접수 없이 부품만 별도 구매 가능합니다. 취급제품 페이지에서 어태치먼트 카테고리를 확인해 주세요.',
  },
]

export default function ServiceGuide() {
  const [openIdx, setOpenIdx] = useState(null)

  return (
    <div className="page-content bg-white">
      <PageHeader title="서비스가이드" showBack />

      {/* 안내 배너 */}
      <div className="mx-4 mt-4 bg-orange-50 border border-orange-100 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xl">📋</span>
          <p className="text-[15px] font-bold text-orange-700">서비스 이용 안내</p>
        </div>
        <p className="text-[12px] text-orange-600 leading-relaxed">
          링크잇 서비스 이용에 대한 자주 묻는 질문을 확인하세요.<br/>
          추가 문의는 고객센터 또는 카카오톡으로 문의해 주세요.
        </p>
      </div>

      {/* 서비스 프로세스 */}
      <div className="px-4 mt-5">
        <h3 className="text-[15px] font-bold text-gray-900 mb-3">서비스 접수 과정</h3>
        <div className="flex items-center gap-0 overflow-x-auto scroll-hide">
          {['접수신청', '담당자확인', '수리진행', '완료통보'].map((step, i) => (
            <div key={i} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center text-[12px] font-bold">
                  {i + 1}
                </div>
                <p className="text-[11px] text-gray-600 font-medium mt-1">{step}</p>
              </div>
              {i < 3 && (
                <div className="w-8 h-0.5 bg-orange-200 mx-1 flex-shrink-0 mb-4"/>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="px-4 mt-5">
        <h3 className="text-[15px] font-bold text-gray-900 mb-3">자주 묻는 질문</h3>
        <div className="flex flex-col gap-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-3.5 text-left active:bg-gray-50"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-[13px] font-bold text-orange-500 flex-shrink-0 mt-0.5">Q</span>
                  <span className="text-[14px] font-medium text-gray-800">{faq.q}</span>
                </div>
                <svg
                  width="18" height="18" viewBox="0 0 24 24" fill="none"
                  className={`flex-shrink-0 ml-2 text-gray-400 transition-transform ${openIdx === i ? 'rotate-180' : ''}`}
                >
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {openIdx === i && (
                <div className="px-4 pb-4 pt-0 bg-gray-50 flex gap-2.5">
                  <span className="text-[13px] font-bold text-blue-500 flex-shrink-0">A</span>
                  <p className="text-[13px] text-gray-600 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="h-6"/>
    </div>
  )
}
