import { NormalizedReportRow } from '@/lib/types/report.types'
import { CreativeLibraryItem, MatchResult } from '@/lib/types/creative.types'

function normalize(name: string): string {
  return name.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9가-힣_]/g, '')
}

export function matchCreatives(
  reportRows: NormalizedReportRow[],
  library: CreativeLibraryItem[]
): MatchResult[] {
  return reportRows.map((row) => {
    const adName = row.ad
    const adNorm = normalize(adName)

    const exact = library.find(
      (c) => normalize(c.filename) === adNorm || c.filename === adName
    ) ?? null

    const partial = exact
      ? []
      : library.filter((c) => {
          const fn = normalize(c.filename)
          return (fn.includes(adNorm) || adNorm.includes(fn)) && fn.length > 2 && adNorm.length > 2
        })

    const status: MatchResult['status'] = exact ? 'matched' : partial.length > 0 ? 'partial' : 'missing'

    return {
      adName,
      platform: row.platform,
      campaign: row.campaign,
      impressions: row.impressions,
      clicks: row.clicks,
      ctr: row.ctr,
      spend: row.spend,
      roas: row.roas,
      exact,
      partial,
      status,
    }
  })
}

export function getUnusedCreatives(
  reportRows: NormalizedReportRow[],
  library: CreativeLibraryItem[]
): CreativeLibraryItem[] {
  const usedIds = new Set<string>()
  const results = matchCreatives(reportRows, library)
  results.forEach((r) => {
    if (r.exact) usedIds.add(r.exact.id)
    r.partial.forEach((p) => usedIds.add(p.id))
  })
  return library.filter((c) => !usedIds.has(c.id))
}
