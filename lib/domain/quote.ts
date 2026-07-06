const FEE_TRACK_A = parseFloat(process.env.PLATFORM_FEE_TRACK_A ?? '0.03')
const FEE_TRACK_B = parseFloat(process.env.PLATFORM_FEE_TRACK_B ?? '0.05')

export function calcTrackAFee(bidPrice: number) {
  const fee = Math.floor(bidPrice * FEE_TRACK_A)
  return { fee, net: bidPrice - fee, rate: FEE_TRACK_A }
}

export function calcTrackBFee(consumerPrice: number, dealerPrice: number, installPrice: number) {
  const margin = consumerPrice - dealerPrice
  const semiDealerFee = Math.floor(margin * FEE_TRACK_B)
  const installerFee = Math.floor(installPrice * FEE_TRACK_B)
  return {
    semiDealerFee,
    installerFee,
    totalFee: semiDealerFee + installerFee,
    semiDealerNet: margin - semiDealerFee,
    installerNet: installPrice - installerFee,
    rate: FEE_TRACK_B,
  }
}

export function calcExpiresAt(auctionHours: 24 | 48 | 72, from = new Date()): string {
  return new Date(from.getTime() + auctionHours * 3600 * 1000).toISOString()
}

export function shouldAutoExtend(bidCount: number, autoExtendedCount: number, maxExtensions = 3): boolean {
  return bidCount === 0 && autoExtendedCount < maxExtensions
}
