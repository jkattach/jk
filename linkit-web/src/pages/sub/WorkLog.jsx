import PageHeader from '../../components/PageHeader'

const POSTS = [
  { id: 1, user: '김철수', time: '2시간 전', title: '현장 작업 공유 (틸트로테이터 사용)', desc: '오늘 도로 확장 공사에서 TR-5000 사용했는데 회전 성능이 정말 좋네요. 추천합니다!', likes: 12, comments: 3 },
  { id: 2, user: '이영호', time: '1일 전', title: '회전링크 설치 완료', desc: 'RL-300 설치하는데 생각보다 쉬웠어요. 가이드 영상 보고 따라 하니까 됐습니다.', likes: 8, comments: 1 },
  { id: 3, user: '박민준', time: '3일 전', title: '중고 레벨기 수령 후기', desc: '링크잇에서 중고 레벨기 A급 구매했는데 상태가 신품이랑 거의 똑같네요. 만족!', likes: 21, comments: 5 },
]

export default function WorkLog() {
  return (
    <div className="page-content bg-gray-50">
      <PageHeader title="작업공유" showBack rightNode={
        <button className="text-[13px] text-orange-500 font-semibold mr-1">글쓰기</button>
      }/>

      <div className="p-4 flex flex-col gap-3">
        {POSTS.map(p => (
          <div key={p.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-base">
                👷
              </div>
              <div>
                <p className="text-[13px] font-semibold text-gray-900">{p.user}</p>
                <p className="text-[11px] text-gray-400">{p.time}</p>
              </div>
            </div>
            <h3 className="text-[14px] font-bold text-gray-900 mb-1">{p.title}</h3>
            <p className="text-[13px] text-gray-600 leading-relaxed">{p.desc}</p>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
              <button className="flex items-center gap-1 text-[12px] text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M20.84 4.61C20.3 4.07 19.66 3.64 18.96 3.35C18.26 3.06 17.51 2.91 16.75 2.91C15.99 2.91 15.24 3.06 14.54 3.35C13.84 3.64 13.2 4.07 12.66 4.61L12 5.27L11.34 4.61C10.25 3.52 8.77 2.91 7.25 2.91C5.73 2.91 4.25 3.52 3.16 4.61C2.07 5.7 1.46 7.18 1.46 8.7C1.46 10.22 2.07 11.7 3.16 12.79L12 21.63L20.84 12.79C21.38 12.25 21.81 11.61 22.1 10.91C22.39 10.21 22.54 9.46 22.54 8.7C22.54 7.94 22.39 7.19 22.1 6.49C21.81 5.79 21.38 5.15 20.84 4.61Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {p.likes}
              </button>
              <button className="flex items-center gap-1 text-[12px] text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15C21 15.55 20.78 16.08 20.37 16.47C19.96 16.86 19.41 17.08 18.83 17.08H7.17L3 21V5.08C3 4.53 3.22 4 3.63 3.61C4.04 3.22 4.59 3 5.17 3H18.83C19.41 3 19.96 3.22 20.37 3.61C20.78 4 21 4.53 21 5.08V15Z" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                {p.comments}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
