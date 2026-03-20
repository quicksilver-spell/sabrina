import { NormalizedReportRow } from '@/lib/types/report.types'
import { Platform } from '@/lib/types/platform.types'

const platformNames: Record<Platform, string> = {
  meta: 'Meta (Facebook/Instagram)',
  google: 'Google Display/Search',
  naver: '네이버 광고',
}

function fmtKRW(n: number): string {
  if (n >= 1_000_000) return '₩' + (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return '₩' + Math.round(n / 1_000) + 'K'
  return '₩' + Math.round(n).toLocaleString('ko-KR')
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString('ko-KR')
}

export function buildImprovementPrompt(row: NormalizedReportRow, platform: Platform): string {
  const lines: string[] = []

  lines.push(`당신은 ${platformNames[platform]} 광고 크리에이티브 전문가입니다.`)
  lines.push(`아래 저성과 광고 소재를 분석하고 구체적인 개선 방안을 제시해주세요.\n`)

  lines.push(`## 소재 정보`)
  lines.push(`- 소재명: "${row.ad}"`)
  if (row.campaign) lines.push(`- 캠페인: ${row.campaign}`)
  if (row.adSet) lines.push(`- 광고세트: ${row.adSet}`)

  lines.push(`\n## 성과 지표`)
  lines.push(`- 노출수: ${fmtNum(row.impressions)}`)
  lines.push(`- 클릭수: ${fmtNum(row.clicks)}`)
  lines.push(`- CTR: ${(row.ctr * 100).toFixed(2)}% (낮은 성과)`)
  lines.push(`- CPC: ${fmtKRW(row.cpc)}`)
  lines.push(`- 집행금액: ${fmtKRW(row.spend)}`)
  if (row.conversions) lines.push(`- 전환수: ${row.conversions}`)
  if (row.roas) lines.push(`- ROAS: ${row.roas.toFixed(2)}`)

  lines.push(`\n다음 3가지 섹션으로 **한국어**로 답변해주세요. 각 섹션은 실행 가능하고 구체적으로 작성해주세요:`)

  lines.push(`\n### 1. 문제 진단`)
  lines.push(`CTR이 낮은 원인을 소재명과 지표를 바탕으로 2~3가지 분석해주세요.`)

  lines.push(`\n### 2. 카피 텍스트 대안 3개`)
  lines.push(`소재명(= 광고 카피/콘셉트)을 개선한 대안을 3개 제시해주세요.`)
  lines.push(`각 대안마다: **제목**, 한 줄 설명, 예상 효과를 포함해주세요.`)

  lines.push(`\n### 3. 비주얼 & 타겟팅 제안`)
  lines.push(`이미지/영상 소재 방향 2가지와 타겟팅 조정 방향 1가지를 제안해주세요.`)

  return lines.join('\n')
}
