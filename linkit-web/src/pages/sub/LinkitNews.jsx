import PageHeader from '../../components/PageHeader'

const NEWS = [
  {
    id: 1,
    badge: '공지',
    title: '2025 하반기 신제품 출시 안내',
    date: '2025.05.20',
    preview: '링크잇에서 하반기 신제품 라인업을 공개합니다. 틸트로테이터 신형 TR-6000과 회전링크 RL-400이 6월 중 출시 예정입니다.',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    id: 2,
    badge: '안내',
    title: '링크잇 서비스센터 이전 안내',
    date: '2025.05.15',
    preview: '5월 30일부터 서비스센터 위치가 변경됩니다. 새 주소: 경기도 화성시 동탄면로 XXX.',
    color: 'bg-gray-100 text-gray-600',
  },
  {
    id: 3,
    badge: '이벤트',
    title: '틸트로테이터 할인 이벤트 (5월 한정)',
    date: '2025.05.10',
    preview: '5월 한달 간 틸트로테이터 전 제품 15% 할인! 한정 수량 소진 시 조기 종료될 수 있습니다.',
    color: 'bg-red-100 text-red-600',
  },
  {
    id: 4,
    badge: '안내',
    title: '앱 서비스 오픈 안내',
    date: '2025.04.28',
    preview: '링크잇 모바일 서비스가 정식 오픈되었습니다. 취급제품 조회, 중고제품, 서비스 접수를 모바일에서 편하게 이용하세요.',
    color: 'bg-gray-100 text-gray-600',
  },
]

export default function LinkitNews() {
  return (
    <div className="page-content bg-gray-50">
      <PageHeader title="링크잇 소식" showBack />

      <div className="p-4 flex flex-col gap-3">
        {NEWS.map(n => (
          <div key={n.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${n.color}`}>{n.badge}</span>
              <span className="text-[11px] text-gray-400">{n.date}</span>
            </div>
            <h3 className="text-[15px] font-bold text-gray-900 mb-1.5">{n.title}</h3>
            <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2">{n.preview}</p>
            <button className="mt-3 text-[12px] text-orange-500 font-semibold">자세히 보기 &gt;</button>
          </div>
        ))}
      </div>
    </div>
  )
}
