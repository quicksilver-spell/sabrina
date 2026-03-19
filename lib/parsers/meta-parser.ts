import { NormalizedReportRow } from '@/lib/types/report.types'
import { v4 as uuidv4 } from 'uuid'

function parseNum(val: string | undefined): number {
  if (!val || val === '--' || val === '') return 0
  return parseFloat(val.replace(/,/g, '').replace(/%/g, '')) || 0
}

function findHeader(headers: string[], candidates: string[]): string | undefined {
  const lower = headers.map((h) => h.toLowerCase().trim())
  return candidates.find((c) => lower.includes(c.toLowerCase()))
}

export function parseMetaCsv(rows: Record<string, string>[]): NormalizedReportRow[] {
  if (!rows.length) return []

  const headers = Object.keys(rows[0])

  // Column aliases
  const campCol = findHeader(headers, ['Campaign name', 'Campaign', '캠페인 이름', '캠페인']) ?? headers[0]
  const adSetCol = findHeader(headers, ['Ad Set Name', 'Ad set name', 'Ad Set', '광고 세트 이름', '광고 세트'])
  const adCol = findHeader(headers, ['Ad Name', 'Ad name', 'Ad', '광고 이름', '광고']) ?? headers[1]
  const impressCol = findHeader(headers, ['Impressions', '노출']) ?? ''
  const clickCol = findHeader(headers, ['Link clicks', 'Clicks (all)', 'Clicks', '링크 클릭 수', '클릭']) ?? ''
  const ctrCol = findHeader(headers, ['CTR (link click-through rate)', 'CTR (All)', 'CTR', '링크 클릭률', 'CTR (전체)']) ?? ''
  const cpcCol = findHeader(headers, ['CPC (Cost per link click)', 'CPC (All)', 'CPC', '링크당 비용', 'CPC (전체)']) ?? ''
  const cpmCol = findHeader(headers, ['CPM (Cost per 1,000 impressions)', 'CPM', '1,000회 노출당 비용']) ?? ''
  const spendCol = findHeader(headers, ['Amount spent (KRW)', 'Amount Spent (KRW)', 'Amount spent', 'Amount Spent', '사용 금액 (KRW)', '사용 금액']) ?? ''
  const roasCol = findHeader(headers, ['Purchase ROAS (return on ad spend)', 'Website purchase ROAS', 'ROAS', '광고비 회수율']) ?? ''
  const convCol = findHeader(headers, ['Results', 'Purchases', 'Conversions', '결과', '구매']) ?? ''
  const dateCol = findHeader(headers, ['Day', 'Date', '일자', '날짜'])

  return rows
    .filter((row) => {
      const campaign = row[campCol]?.trim()
      return campaign && campaign !== 'Campaign name' && campaign !== '캠페인 이름'
    })
    .map((row) => ({
      id: uuidv4(),
      platform: 'meta' as const,
      campaign: row[campCol]?.trim() ?? '',
      adSet: adSetCol ? row[adSetCol]?.trim() : undefined,
      ad: adCol ? row[adCol]?.trim() ?? '' : '',
      impressions: parseNum(row[impressCol]),
      clicks: parseNum(row[clickCol]),
      ctr: parseNum(row[ctrCol]) / 100,
      spend: parseNum(row[spendCol]),
      cpc: parseNum(row[cpcCol]),
      cpm: cpmCol ? parseNum(row[cpmCol]) : undefined,
      conversions: convCol ? parseNum(row[convCol]) : undefined,
      roas: roasCol ? parseNum(row[roasCol]) : undefined,
      date: dateCol ? row[dateCol]?.trim() : undefined,
      rawRow: row,
    }))
}
