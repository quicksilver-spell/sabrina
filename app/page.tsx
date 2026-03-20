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
    <div className="space-y-10 animate-fade-in">
      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-2xl px-10 py-14"
        style={{ background: 'linear-gradient(135deg, #17171A 0%, #1E1E24 100%)', border: '1px solid #2A2A35' }}
      >
        {/* Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #7C6AF7 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #9D8FFF 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-medium"
            style={{ background: '#7C6AF720', border: '1px solid #7C6AF740', color: '#9D8FFF' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#7C6AF7] animate-pulse" />
            AI 기반 광고 크리에이티브 플랫폼
          </div>

          <h1 className="text-5xl font-bold leading-tight mb-4">
            <span className="gradient-text">광고 성과를 분석하고,</span>
            <br />
            <span className="text-[#F2F2F5]">크리에이티브를 제작하세요.</span>
          </h1>

          <p className="text-lg text-[#8E8EA0] max-w-xl leading-relaxed mb-8">
            Meta · Google · Naver 광고 리포트를 업로드하면 AI가 성과를 분석합니다.
            분석 결과를 바탕으로 크리에이티브를 제작하고 utm_content 파일명으로 관리하세요.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/analysis/meta"
              className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #7C6AF7 0%, #9D8FFF 100%)' }}
            >
              리포트 분석 시작 →
            </Link>
            <Link
              href="/creative"
              className="px-6 py-3 rounded-xl text-sm font-medium transition-all hover:bg-[#1E1E24]"
              style={{ background: '#17171A', border: '1px solid #2A2A35', color: '#8E8EA0' }}
            >
              크리에이티브 제작
            </Link>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '업로드된 매체', value: `${totalUploaded} / 3`, color: '#7C6AF7' },
          { label: '분석된 소재', value: platformStats.reduce((s, p) => s + p.rows, 0).toLocaleString(), color: '#1877F2' },
          { label: '라이브러리 소재', value: totalCreatives.toLocaleString(), color: '#4285F4' },
          { label: '총 집행금액', value: '₩' + Math.round(platformStats.reduce((s, p) => s + p.spend, 0) / 1000) + 'K', color: '#03C75A' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-5" style={{ background: '#17171A', border: '1px solid #2A2A35' }}>
            <p className="text-sm text-[#52525E] mb-2">{s.label}</p>
            <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Platform Status */}
      <div>
        <h2 className="text-lg font-semibold text-[#F2F2F5] mb-4">매체별 현황</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {platformStats.map(({ platform, config, hasData, rows, spend, ctr }) => (
            <Link
              key={platform}
              href={`/analysis/${platform}`}
              className="rounded-xl p-6 transition-all hover:scale-[1.01] group"
              style={{ background: '#17171A', border: '1px solid #2A2A35' }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: config.color }}>
                  {config.icon}
                </div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-[#F2F2F5] group-hover:text-[#9D8FFF] transition-colors">{config.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${hasData ? 'bg-[#03C75A]' : 'bg-[#52525E]'}`} />
                    <p className="text-xs text-[#52525E]">{hasData ? '데이터 있음' : '리포트 미업로드'}</p>
                  </div>
                </div>
                <span className="text-[#52525E] group-hover:text-[#8E8EA0] transition-colors text-lg">›</span>
              </div>
              {hasData ? (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-[#52525E] mb-1">소재 수</p>
                    <p className="text-lg font-semibold text-[#F2F2F5]">{rows.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#52525E] mb-1">집행금액</p>
                    <p className="text-lg font-semibold text-[#F2F2F5]">₩{Math.round(spend / 1000)}K</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#52525E] mb-1">평균 CTR</p>
                    <p className="text-lg font-semibold" style={{ color: config.color }}>{(ctr * 100).toFixed(2)}%</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#52525E]">클릭해서 리포트 업로드</p>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-[#F2F2F5] mb-4">빠른 이동</h2>
        <div className="flex flex-wrap gap-3">
          {quickLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02]"
              style={{ background: '#17171A', border: '1px solid #2A2A35', color: '#8E8EA0' }}
            >
              <span className="text-base" style={{ color: l.color }}>{l.icon}</span>
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
