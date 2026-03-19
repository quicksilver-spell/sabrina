import { NormalizedReportRow, PlatformMetrics } from '@/lib/types/report.types'
import { Platform } from '@/lib/types/platform.types'

const platformNames: Record<Platform, string> = {
  meta: 'Meta (Facebook/Instagram)',
  google: 'Google Ads',
  naver: 'Naver 광고',
}

export function buildAnalysisPrompt(metrics: PlatformMetrics): string {
  const { summary, topCreatives, bottomCreatives, campaignBreakdown } = metrics
  const pName = platformNames[summary.platform]

  const fmtNum = (n: number) => n.toLocaleString('ko-KR', { maximumFractionDigits: 2 })
  const fmtPct = (n: number) => (n * 100).toFixed(2) + '%'
  const fmtKRW = (n: number) => Math.round(n).toLocaleString('ko-KR') + '원'

  const topStr = topCreatives
    .map((r, i) =>
      `  ${i + 1}. "${r.ad}" | 노출:${fmtNum(r.impressions)} | 클릭:${fmtNum(r.clicks)} | CTR:${fmtPct(r.ctr)} | CPC:${fmtKRW(r.cpc)}${r.roas ? ' | ROAS:' + fmtNum(r.roas) : ''}`
    )
    .join('\n')

  const bottomStr = bottomCreatives
    .map((r, i) =>
      `  ${i + 1}. "${r.ad}" | 노출:${fmtNum(r.impressions)} | 클릭:${fmtNum(r.clicks)} | CTR:${fmtPct(r.ctr)} | CPC:${fmtKRW(r.cpc)}`
    )
    .join('\n')

  const campStr = campaignBreakdown
    .slice(0, 5)
    .map((c) => `  - ${c.campaign}: 집행금액 ${fmtKRW(c.spend)}, 클릭 ${fmtNum(c.clicks)}`)
    .join('\n')

  return `당신은 디지털 광고 성과 분석 전문가입니다. 아래 ${pName} 광고 데이터를 분석하고 마케터가 바로 활용할 수 있는 인사이트를 제공해주세요.

## 전체 성과 요약
- 총 소재 수: ${fmtNum(summary.totalRows)}개
- 총 노출: ${fmtNum(summary.totalImpressions)}
- 총 클릭: ${fmtNum(summary.totalClicks)}
- 평균 CTR: ${fmtPct(summary.avgCtr)}
- 평균 CPC: ${fmtKRW(summary.avgCpc)}
- 총 집행금액: ${fmtKRW(summary.totalSpend)}
${summary.avgRoas ? `- 평균 ROAS: ${fmtNum(summary.avgRoas)}` : ''}

## 상위 성과 소재 (CTR 기준 TOP 5)
${topStr}

## 하위 성과 소재 (CTR 기준 BOTTOM 5)
${bottomStr}

## 캠페인별 집행 현황
${campStr}

다음 3가지 섹션으로 한국어로 답변해주세요:

### 1. 핵심 성과 패턴
상위 소재와 하위 소재의 차이점, 성과가 좋은 소재의 공통점 분석 (3-4문장)

### 2. 개선 기회
성과가 저조한 소재의 문제점과 구체적인 개선 방향 제시 (3-4문장)

### 3. 크리에이티브 제작 추천
데이터를 바탕으로 다음 크리에이티브 제작 시 고려해야 할 요소들 (불릿포인트 3-5개)

분석은 실용적이고 구체적으로 작성해주세요.`
}
