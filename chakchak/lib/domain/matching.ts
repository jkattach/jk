type InstallerScore = {
  installer_id: string
  region_proximity: number  // 0~1 (동일시 1, 동일도 0.6, 타도 0.2)
  rating: number            // 0~5
  avg_response_min: number  // 분 단위
  bid_price: number
  category_median_price: number
}

export function scoreInstaller(params: InstallerScore): number {
  const { region_proximity, rating, avg_response_min, bid_price, category_median_price } = params

  const normalizedRating = rating / 5
  const normalizedSpeed = Math.max(0, 1 - avg_response_min / 60)
  const normalizedPrice = category_median_price > 0
    ? Math.max(0, 1 - bid_price / category_median_price)
    : 0

  return (
    0.40 * region_proximity +
    0.30 * normalizedRating +
    0.20 * normalizedSpeed +
    0.10 * normalizedPrice
  )
}

export function regionProximity(
  auctionSido: string,
  auctionSigungu: string | null,
  installerSido: string,
  installerSigungu: string | null
): number {
  if (auctionSido !== installerSido) return 0.2
  if (!auctionSigungu || !installerSigungu) return 0.6
  return auctionSigungu === installerSigungu ? 1.0 : 0.6
}

export function selectTopInstallers(
  installers: InstallerScore[],
  topN = 3
): (InstallerScore & { score: number })[] {
  return installers
    .map(i => ({ ...i, score: scoreInstaller(i) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
}
