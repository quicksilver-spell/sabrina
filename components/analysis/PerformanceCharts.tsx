'use client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { PlatformMetrics } from '@/lib/types/report.types'
import { Platform } from '@/lib/types/platform.types'

const platformColors: Record<Platform, string> = {
  meta: '#1877F2',
  google: '#4285F4',
  naver: '#03C75A',
}

const COLORS = ['#7C6AF7', '#1877F2', '#4285F4', '#03C75A', '#F59E0B']

interface ChartProps {
  metrics: PlatformMetrics
}

const tooltipStyle = {
  contentStyle: { background: '#1E1E24', border: '1px solid #2A2A35', borderRadius: 8, color: '#F2F2F5' },
  labelStyle: { color: '#8E8EA0', fontSize: 12 },
}

export function TopCreativesChart({ metrics }: ChartProps) {
  const color = platformColors[metrics.summary.platform]
  const data = metrics.topCreatives.map((r) => ({
    name: r.ad.length > 20 ? r.ad.slice(0, 20) + '…' : r.ad,
    CTR: parseFloat((r.ctr * 100).toFixed(2)),
    클릭: r.clicks,
    CPC: Math.round(r.cpc),
  }))

  return (
    <div className="rounded-xl p-5" style={{ background: '#17171A', border: '1px solid #2A2A35' }}>
      <h3 className="text-sm font-medium text-[#F2F2F5] mb-4">상위 소재 CTR 비교</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ left: 0, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" />
          <XAxis dataKey="name" tick={{ fill: '#52525E', fontSize: 11 }} />
          <YAxis tick={{ fill: '#52525E', fontSize: 11 }} unit="%" />
          <Tooltip {...tooltipStyle} formatter={(v) => [`${v}%`, 'CTR']} />
          <Bar dataKey="CTR" fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function CampaignSpendChart({ metrics }: ChartProps) {
  const data = metrics.campaignBreakdown.slice(0, 6).map((c) => ({
    name: c.campaign.length > 15 ? c.campaign.slice(0, 15) + '…' : c.campaign,
    집행금액: Math.round(c.spend),
    클릭: c.clicks,
  }))

  return (
    <div className="rounded-xl p-5" style={{ background: '#17171A', border: '1px solid #2A2A35' }}>
      <h3 className="text-sm font-medium text-[#F2F2F5] mb-4">캠페인별 집행금액</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" />
          <XAxis type="number" tick={{ fill: '#52525E', fontSize: 11 }} />
          <YAxis dataKey="name" type="category" tick={{ fill: '#52525E', fontSize: 11 }} width={100} />
          <Tooltip {...tooltipStyle} formatter={(v) => ['₩' + Number(v).toLocaleString('ko-KR'), '집행금액']} />
          <Bar dataKey="집행금액" fill="#7C6AF7" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function SpendPieChart({ metrics }: ChartProps) {
  const data = metrics.campaignBreakdown.slice(0, 5).map((c, i) => ({
    name: c.campaign.length > 12 ? c.campaign.slice(0, 12) + '…' : c.campaign,
    value: Math.round(c.spend),
    fill: COLORS[i % COLORS.length],
  }))

  return (
    <div className="rounded-xl p-5" style={{ background: '#17171A', border: '1px solid #2A2A35' }}>
      <h3 className="text-sm font-medium text-[#F2F2F5] mb-4">캠페인 예산 분포</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            {...tooltipStyle}
            formatter={(v) => ['₩' + Number(v).toLocaleString('ko-KR'), '집행금액']}
          />
          <Legend
            formatter={(value) => <span style={{ color: '#8E8EA0', fontSize: 11 }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
