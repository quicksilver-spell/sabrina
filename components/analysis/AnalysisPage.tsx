'use client'
import { Platform, PLATFORMS } from '@/lib/types/platform.types'
import { useReportStore } from '@/store/reportStore'
import FileUploadZone from './FileUploadZone'
import MetricsOverview from './MetricsOverview'
import { TopCreativesChart, CampaignSpendChart, SpendPieChart } from './PerformanceCharts'
import AIInsightsPanel from './AIInsightsPanel'
import CreativeTable from './CreativeTable'

export default function AnalysisPage({ platform }: { platform: Platform }) {
  const store = useReportStore()
  const report = store.reports[platform]
  const metrics = store.metrics[platform]
  const config = PLATFORMS[platform]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Platform header */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold"
          style={{ background: config.color }}
        >
          {config.icon}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#F2F2F5]">{config.name} 성과 분석</h2>
          <p className="text-xs text-[#52525E]">
            {metrics ? `${metrics.summary.totalRows.toLocaleString()}개 소재 분석됨` : '리포트 파일을 업로드해주세요'}
          </p>
        </div>
      </div>

      {/* Upload */}
      <FileUploadZone platform={platform} />

      {/* Metrics + Charts */}
      {metrics && (
        <>
          <MetricsOverview summary={metrics.summary} />

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            <TopCreativesChart metrics={metrics} />
            <CampaignSpendChart metrics={metrics} />
            <SpendPieChart metrics={metrics} />
          </div>

          <AIInsightsPanel platform={platform} />

          <CreativeTable rows={report.rows} platform={platform} />
        </>
      )}
    </div>
  )
}
