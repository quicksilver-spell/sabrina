import { NormalizedReportRow, ReportSummary, PlatformMetrics } from '@/lib/types/report.types'
import { Platform } from '@/lib/types/platform.types'

export function calculateMetrics(rows: NormalizedReportRow[], platform: Platform): PlatformMetrics {
  if (!rows.length) {
    return {
      summary: {
        totalRows: 0,
        totalImpressions: 0,
        totalClicks: 0,
        totalSpend: 0,
        avgCtr: 0,
        avgCpc: 0,
        detectedColumns: [],
        platform,
      },
      topCreatives: [],
      bottomCreatives: [],
      campaignBreakdown: [],
    }
  }

  const totalImpressions = rows.reduce((s, r) => s + r.impressions, 0)
  const totalClicks = rows.reduce((s, r) => s + r.clicks, 0)
  const totalSpend = rows.reduce((s, r) => s + r.spend, 0)
  const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0
  const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0

  const roasRows = rows.filter((r) => r.roas !== undefined)
  const avgRoas = roasRows.length > 0
    ? roasRows.reduce((s, r) => s + (r.roas ?? 0), 0) / roasRows.length
    : undefined

  // Get date range
  const dates = rows.filter((r) => r.date).map((r) => r.date as string).sort()
  const dateRange = dates.length >= 2
    ? { from: dates[0], to: dates[dates.length - 1] }
    : undefined

  // Sort by CTR for top/bottom
  const sorted = [...rows].sort((a, b) => b.ctr - a.ctr)
  const topCreatives = sorted.slice(0, 5)
  const bottomCreatives = sorted.slice(-5).reverse()

  // Campaign breakdown
  const campMap = new Map<string, { spend: number; clicks: number; impressions: number }>()
  for (const row of rows) {
    const existing = campMap.get(row.campaign) ?? { spend: 0, clicks: 0, impressions: 0 }
    campMap.set(row.campaign, {
      spend: existing.spend + row.spend,
      clicks: existing.clicks + row.clicks,
      impressions: existing.impressions + row.impressions,
    })
  }
  const campaignBreakdown = Array.from(campMap.entries())
    .map(([campaign, data]) => ({
      campaign,
      spend: data.spend,
      clicks: data.clicks,
      ctr: data.impressions > 0 ? data.clicks / data.impressions : 0,
    }))
    .sort((a, b) => b.spend - a.spend)

  const summary: ReportSummary = {
    totalRows: rows.length,
    totalImpressions,
    totalClicks,
    totalSpend,
    avgCtr,
    avgCpc,
    avgRoas,
    dateRange,
    detectedColumns: Object.keys(rows[0]?.rawRow ?? {}),
    platform,
  }

  return { summary, topCreatives, bottomCreatives, campaignBreakdown }
}
