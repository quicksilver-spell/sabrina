'use client'
import { ReportSummary } from '@/lib/types/report.types'
import { Platform } from '@/lib/types/platform.types'

interface MetricCardProps {
  label: string
  value: string
  sub?: string
  color?: string
}

function MetricCard({ label, value, sub, color }: MetricCardProps) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-1.5"
      style={{ background: '#17171A', border: '1px solid #2A2A35' }}
    >
      <p className="text-xs text-[#52525E] uppercase tracking-wide">{label}</p>
      <p
        className="text-3xl font-bold"
        style={{ color: color ?? '#F2F2F5' }}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-[#52525E]">{sub}</p>}
    </div>
  )
}

const platformColors: Record<Platform, string> = {
  meta: '#1877F2',
  google: '#4285F4',
  naver: '#03C75A',
}

function fmtNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString('ko-KR', { maximumFractionDigits: 0 })
}

function fmtKRW(n: number) {
  if (n >= 1_000_000) return '₩' + (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return '₩' + Math.round(n / 1_000) + 'K'
  return '₩' + Math.round(n).toLocaleString('ko-KR')
}

export default function MetricsOverview({ summary }: { summary: ReportSummary }) {
  const color = platformColors[summary.platform]

  const metrics: MetricCardProps[] = [
    { label: '총 노출', value: fmtNum(summary.totalImpressions), sub: '총 노출 횟수', color },
    { label: '총 클릭', value: fmtNum(summary.totalClicks), sub: '총 클릭 수' },
    { label: '평균 CTR', value: (summary.avgCtr * 100).toFixed(2) + '%', sub: '클릭률' },
    { label: '평균 CPC', value: fmtKRW(summary.avgCpc), sub: '클릭당 비용' },
    { label: '총 집행금액', value: fmtKRW(summary.totalSpend), sub: '광고 집행금액', color },
    ...(summary.avgRoas
      ? [{ label: '평균 ROAS', value: summary.avgRoas.toFixed(2) + 'x', sub: '광고수익률', color }]
      : []),
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {metrics.map((m) => (
        <MetricCard key={m.label} {...m} />
      ))}
    </div>
  )
}
