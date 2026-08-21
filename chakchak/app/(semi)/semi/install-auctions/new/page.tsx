import { requireAuth } from '@/lib/auth/rbac'
import InstallAuctionForm from './InstallAuctionForm'

export default async function InstallAuctionNewPage() {
  const { user } = await requireAuth(['semi_dealer'])

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-2">장착경매 발주</h1>
        <p className="text-sm text-gray-500 mb-6">장착자를 모집하는 경매를 시작합니다. 수수료 5%가 차감됩니다.</p>
        <InstallAuctionForm semiDealerId={user.id} />
      </div>
    </main>
  )
}
