import { NormalizedReportRow } from '@/lib/types/report.types'
import { v4 as uuidv4 } from 'uuid'

function parseNum(val: string | undefined): number {
  if (!val || val === '--' || val === '') return 0
  const cleaned = val.replace(/,/g, '').replace(/%/g, '').replace(/</g, '').trim()
  return parseFloat(cleaned) || 0
}

function findHeader(headers: string[], candidates: string[]): string | undefined {
  const lower = headers.map((h) => h.toLowerCase().trim())
  return candidates.find((c) => lower.includes(c.toLowerCase()))
}

export function parseGoogleCsv(rows: Record<string, string>[]): NormalizedReportRow[] {
  // Google CSV exports start with metadata rows before the actual header row
  // Find the actual data rows by locating where real headers start
  const dataRows = rows.filter((row) => {
    const vals = Object.values(row)
    return vals.some((v) => v && v.trim() !== '' && v !== '--')
  })

  if (!dataRows.length) return []

  const headers = Object.keys(dataRows[0])

  const campCol = findHeader(headers, ['Campaign', 'Campaign name']) ?? headers[0]
  const adGroupCol = findHeader(headers, ['Ad group', 'Ad Group', 'Ad group name'])
  const adCol = findHeader(headers, ['Ad', 'Ad name', 'Description line 1', 'Headline 1']) ?? headers[1]
  const impressCol = findHeader(headers, ['Impressions', 'Impr.']) ?? ''
  const clickCol = findHeader(headers, ['Clicks']) ?? ''
  const ctrCol = findHeader(headers, ['CTR']) ?? ''
  const cpcCol = findHeader(headers, ['Avg. CPC', 'Avg CPC', 'Cost / conv.']) ?? ''
  const spendCol = findHeader(headers, ['Cost', 'Spend', '비용']) ?? ''
  const convCol = findHeader(headers, ['Conversions', 'Conv.']) ?? ''
  const convRateCol = findHeader(headers, ['Conv. rate', 'Conv rate']) ?? ''
  const dateCol = findHeader(headers, ['Day', 'Date', 'Week', 'Month'])

  return dataRows
    .filter((row) => {
      const campaign = row[campCol]?.trim()
      return campaign && campaign !== 'Campaign' && campaign !== '--' && campaign !== 'Total'
    })
    .map((row) => {
      const clicks = parseNum(row[clickCol])
      const spend = parseNum(row[spendCol])
      const cpc = cpcCol ? parseNum(row[cpcCol]) : clicks > 0 ? spend / clicks : 0
      const impressions = parseNum(row[impressCol])
      const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0

      return {
        id: uuidv4(),
        platform: 'google' as const,
        campaign: row[campCol]?.trim() ?? '',
        adSet: adGroupCol ? row[adGroupCol]?.trim() : undefined,
        ad: adCol ? row[adCol]?.trim() ?? '' : '',
        impressions,
        clicks,
        ctr: ctrCol ? parseNum(row[ctrCol]) / 100 : impressions > 0 ? clicks / impressions : 0,
        spend,
        cpc,
        cpm,
        conversions: convCol ? parseNum(row[convCol]) : undefined,
        convRate: convRateCol ? parseNum(row[convRateCol]) / 100 : undefined,
        date: dateCol ? row[dateCol]?.trim() : undefined,
        rawRow: row,
      }
    })
}
