import PageHeader from '../../components/PageHeader'

const CHATS = [
  {
    id: 1,
    name: '링크잇 고객센터',
    last: 'TR-5000 수리 접수가 완료되었습니다.',
    time: '오전 10:22',
    unread: 2,
    avatar: '🏢',
  },
  {
    id: 2,
    name: '기술지원팀',
    last: '부품 도착 예정일은 다음주 화요일입니다.',
    time: '어제',
    unread: 0,
    avatar: '🔧',
  },
  {
    id: 3,
    name: '링크잇 고객센터',
    last: '안녕하세요! 무엇을 도와드릴까요?',
    time: '5/20',
    unread: 0,
    avatar: '🏢',
  },
]

export default function ChatHistory() {
  return (
    <div className="page-content bg-white">
      <PageHeader title="채팅기록" showBack />

      {CHATS.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-gray-200 mb-3">
            <path d="M21 15C21 15.55 20.78 16.08 20.37 16.47C19.96 16.86 19.41 17.08 18.83 17.08H7.17L3 21V5.08C3 4.53 3.22 4 3.63 3.61C4.04 3.22 4.59 3 5.17 3H18.83C19.41 3 19.96 3.22 20.37 3.61C20.78 4 21 4.53 21 5.08V15Z" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          <p className="text-[14px]">채팅 기록이 없습니다</p>
        </div>
      ) : (
        <div>
          {CHATS.map(chat => (
            <button key={chat.id} className="w-full flex items-center px-4 py-3.5 border-b border-gray-100 active:bg-gray-50 text-left">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-2xl mr-3 flex-shrink-0">
                {chat.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-[15px] font-semibold text-gray-900">{chat.name}</p>
                  <p className="text-[11px] text-gray-400 flex-shrink-0 ml-2">{chat.time}</p>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-[13px] text-gray-500 truncate pr-2">{chat.last}</p>
                  {chat.unread > 0 && (
                    <span className="flex-shrink-0 bg-orange-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="fixed bottom-20 right-4 max-w-[480px]">
        <button className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center shadow-lg text-white">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M21 15C21 15.55 20.78 16.08 20.37 16.47C19.96 16.86 19.41 17.08 18.83 17.08H7.17L3 21V5.08C3 4.53 3.22 4 3.63 3.61C4.04 3.22 4.59 3 5.17 3H18.83C19.41 3 19.96 3.22 20.37 3.61C20.78 4 21 4.53 21 5.08V15Z" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
