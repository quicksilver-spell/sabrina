'use client'
import Link from 'next/link'
import { useReportStore } from '@/store/reportStore'
import { useLibraryStore } from '@/store/libraryStore'
import { PLATFORMS, Platform } from '@/lib/types/platform.types'

const quickLinks = [
  { href: '/analysis/meta', label: 'Meta 분석', icon: 'M', color: '#1877F2' },
  { href: '/analysis/google', label: 'Google 분석', icon: 'G', color: '#4285F4' },
  { href: '/analysis/naver', label: 'Naver 분석', icon: 'N', color: '#03C75A' },
  { href: '/creative', label: '크리에이티브 제작', icon: '✦', color: '#7C6AF7' },
  { href: '/matching', label: '소재 매칭', icon: '⇄', color: '#F59E0B' },
]

export default function DashboardPage() {
  const reportStore = useReportStore()
  const library = useLibraryStore()

  const platformStats = (['meta', 'google', 'naver'] as Platform[]).map((p) => {
    const report = reportStore.reports[p]
    const metrics = reportStore.metrics[p]
    return {
      platform: p,
      config: PLATFORMS[p],
      hasData: report.status === 'done',
      rows: metrics?.summary.totalRows ?? 0,
      spend: metrics?.summary.totalSpend ?? 0,
      ctr: metrics?.summary.avgCtr ?? 0,
    }
  })

  const totalUploaded = platformStats.filter((s) => s.hasData).length
  const totalCreatives = library.items.length

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl p-8" style={{ background: 'linear-gradient(135deg, #17171A 0%, #1E1E24 100%)', border: '1px solid #2A2A35' }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #7C6AF7 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg, #7C6AF7 0%, #9D8FFF 100%)' }}>
              S
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">사브리나</h1>
              <p className="text-xs text-[#52525E]">광고 크리에이티브 분석 & 제작 플랫폼</p>
            </div>
          </div>
          <p className="text-sm text-[#8E8EA0] max-w-lg">
            Meta, Google, Naver 광고 리포트를 업로드하고 AI가 성과를 분석합니다.
            분석 결과를 바탕으로 크리에이티브를 제작하고 utm_content 파일명 규칙으로 관리하세요.
          </p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: '업로드된 매체', value: `${totalUploaded} / 3`, color: '#7C6AF7' },
          { label: '분석된 소재', value: platformStats.reduce((s, p) => s + p.rows, 0).toLocaleString(), color: '#1877F2' },
          { label: '라이브러리 소재', value: totalCreatives.toLocaleString(), color: '#4285F4' },
          { label: '총 집행금액', value: '₩' + Math.round(platformStats.reduce((s, p) => s + p.spend, 0) / 1000) + 'K', color: '#03C75A' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: '#17171A', border: '1px solid #2A2A35' }}>
            <p className="text-xs text-[#52525E]">{s.label}</p>
            <p className="text-xl font-semibold mt-1" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Platform Status */}
      <div>
        <h2 className="text-sm font-semibold text-[#8E8EA0] mb-3 uppercase tracking-wide">매체별 현황</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {platformStats.map(({ platform, config, hasData, rows, spend, ctr }) => (
            <Link
              key={platform}
              href={`/analysis/${platform}`}
              className="rounded-xl p-5 transition-all hover:scale-[1.01] group"
              style={{ background: '#17171A', border: '1px solid #2A2A35' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: config.color }}>
                  {config.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#F2F2F5] group-hover:text-[#9D8FFF] transition-colors">{config.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${hasData ? 'bg-[#03C75A]' : 'bg-[#52525E]'}`} />
                    <p className="text-xs text-[#52525E]">{hasData ? '데이터 있음' : '리포트 미업로드'}</p>
                  </div>
                </div>
                <span className="text-[#52525E] group-hover:text-[#8E8EA0] transition-colors text-sm">›</span>
              </div>
              {hasData ? (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-xs text-[#52525E]">소재 수</p>
                    <p className="text-sm font-medium text-[#F2F2F5]">{rows.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#52525E]">집행금액</p>
                    <p className="text-sm font-medium text-[#F2F2F5]">₩{Math.round(spend / 1000)}K</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#52525E]">평균 CTR</p>
                    <p className="text-sm font-medium" style={{ color: config.color }}>{(ctr * 100).toFixed(2)}%</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#52525E]">클릭해서 리포트 업로드</p>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-[#8E8EA0] mb-3 uppercase tracking-wide">빠른 이동</h2>
        <div className="flex flex-wrap gap-2">
          {quickLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all hover:scale-[1.02]"
              style={{ background: '#17171A', border: '1px solid #2A2A35', color: '#8E8EA0' }}
            >
              <span style={{ color: l.color }}>{l.icon}</span>
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
