import { NormalizedReportRow } from '@/lib/types/report.types'
import { v4 as uuidv4 } from 'uuid'

function toNum(val: string | number | undefined): number {
  if (val === undefined || val === null || val === '') return 0
  if (typeof val === 'number') return val
  return parseFloat(String(val).replace(/,/g, '').replace(/%/g, '')) || 0
}

function findHeader(headers: string[], candidates: string[]): string | undefined {
  return candidates.find((c) => headers.includes(c))
}

export function parseNaverRows(rows: Record<string, string | number>[]): NormalizedReportRow[] {
  if (!rows.length) return []

  const headers = Object.keys(rows[0])

  const campCol = findHeader(headers, ['캠페인', '캠페인명', '캠페인 이름']) ?? headers[0]
  const adGroupCol = findHeader(headers, ['광고그룹', '광고그룹명', '광고 그룹'])
  const adCol = findHeader(headers, ['소재명', '소재', '광고', '키워드']) ?? headers[1]
  const impressCol = findHeader(headers, ['노출수', '노출 수', '노출']) ?? ''
  const clickCol = findHeader(headers, ['클릭수', '클릭 수', '클릭']) ?? ''
  const ctrCol = findHeader(headers, ['클릭률', 'CTR', '클릭율']) ?? ''
  const cpcCol = findHeader(headers, ['평균클릭비용', '평균 클릭 비용', 'CPC', '평균CPC']) ?? ''
  const spendCol = findHeader(headers, ['총비용', '비용', '광고비', '총 비용(VAT 포함, 원)']) ?? ''
  const convCol = findHeader(headers, ['전환수', '전환 수', '전환수(클릭후)', '구매수']) ?? ''
  const roasCol = findHeader(headers, ['ROAS', '광고수익률', '수익률']) ?? ''
  const dateCol = findHeader(headers, ['일자', '날짜', 'Date', 'Day'])

  return rows
    .filter((row) => {
      const campaign = String(row[campCol] ?? '').trim()
      return campaign && campaign !== '캠페인' && campaign !== '합계' && campaign !== 'Total'
    })
    .map((row) => {
      const impressions = toNum(row[impressCol])
      const clicks = toNum(row[clickCol])
      const spend = toNum(row[spendCol])
      const cpc = cpcCol ? toNum(row[cpcCol]) : clicks > 0 ? spend / clicks : 0
      const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0
      const ctr = ctrCol ? toNum(row[ctrCol]) / 100 : impressions > 0 ? clicks / impressions : 0

      return {
        id: uuidv4(),
        platform: 'naver' as const,
        campaign: String(row[campCol] ?? '').trim(),
        adSet: adGroupCol ? String(row[adGroupCol] ?? '').trim() : undefined,
        ad: adCol ? String(row[adCol] ?? '').trim() : '',
        impressions,
        clicks,
        ctr,
        spend,
        cpc,
        cpm,
        conversions: convCol ? toNum(row[convCol]) : undefined,
        roas: roasCol ? toNum(row[roasCol]) : undefined,
        date: dateCol ? String(row[dateCol] ?? '').trim() : undefined,
        rawRow: Object.fromEntries(Object.entries(row).map(([k, v]) => [k, String(v)])),
      }
    })
}
