import { useState } from 'react'
import PageHeader from '../../components/PageHeader'

const SETTINGS = [
  { id: 'service', label: '서비스 접수 알림', desc: '서비스 접수 및 처리 현황 알림' },
  { id: 'product', label: '신제품 알림', desc: '새로운 제품 출시 안내' },
  { id: 'discount', label: '할인/이벤트 알림', desc: '할인 행사 및 이벤트 안내' },
  { id: 'chat', label: '채팅 알림', desc: '새 메시지 수신 알림' },
  { id: 'notice', label: '공지사항 알림', desc: '링크잇 공지사항 및 업데이트' },
]

function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-orange-500' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-6' : ''}`}/>
    </button>
  )
}

export default function NotificationSettings() {
  const [settings, setSettings] = useState(
    Object.fromEntries(SETTINGS.map(s => [s.id, true]))
  )

  const toggle = (id, val) => setSettings(prev => ({ ...prev, [id]: val }))
  const allOn = Object.values(settings).every(Boolean)

  return (
    <div className="page-content bg-white">
      <PageHeader title="알림설정" showBack />

      <div className="px-4 pt-4">
        {/* 전체 토글 */}
        <div className="flex items-center justify-between py-4 border-b-2 border-gray-200 mb-2">
          <div>
            <p className="text-[16px] font-bold text-gray-900">전체 알림</p>
            <p className="text-[12px] text-gray-400 mt-0.5">모든 알림을 한번에 설정합니다</p>
          </div>
          <Toggle
            checked={allOn}
            onChange={(val) => setSettings(Object.fromEntries(SETTINGS.map(s => [s.id, val])))}
          />
        </div>

        {SETTINGS.map(s => (
          <div key={s.id} className="flex items-center justify-between py-4 border-b border-gray-100">
            <div>
              <p className="text-[14px] font-semibold text-gray-800">{s.label}</p>
              <p className="text-[12px] text-gray-400 mt-0.5">{s.desc}</p>
            </div>
            <Toggle checked={settings[s.id]} onChange={(val) => toggle(s.id, val)}/>
          </div>
        ))}
      </div>

      <div className="px-4 pt-5">
        <button className="w-full py-3.5 bg-orange-500 text-white font-bold text-[15px] rounded-xl">
          저장하기
        </button>
      </div>
    </div>
  )
}
