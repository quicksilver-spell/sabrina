'use client'
import { useState } from 'react'
import { useReportStore } from '@/store/reportStore'
import { Platform } from '@/lib/types/platform.types'

export default function AIInsightsPanel({ platform }: { platform: Platform }) {
  const store = useReportStore()
  const status = store.insightStatus[platform]
  const insights = store.insights[platform]
  const metrics = store.metrics[platform]
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!metrics) return
    store.clearInsight(platform)
    store.setInsightStatus(platform, 'loading')

    try {
      const { streamClaudeAnalysis } = await import('@/lib/client-api/claudeAnalyze')
      await streamClaudeAnalysis(
        metrics,
        (chunk) => store.appendInsightChunk(platform, chunk),
        () => store.setInsightStatus(platform, 'done'),
        (err) => {
          store.setInsightStatus(platform, 'error')
          store.appendInsightChunk(platform, '\n\n오류: ' + err)
        }
      )
    } catch (err) {
      store.setInsightStatus(platform, 'error')
      store.appendInsightChunk(platform, '\n\n오류: ' + (err instanceof Error ? err.message : '알 수 없는 오류'))
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(insights)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl p-5" style={{ background: '#17171A', border: '1px solid #2A2A35' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-base">✦</span>
          <h3 className="text-sm font-medium text-[#F2F2F5]">AI 인사이트</h3>
          {status === 'loading' && (
            <span className="text-xs text-[#7C6AF7] animate-pulse">분석 중...</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {insights && (
            <button
              onClick={handleCopy}
              className="text-xs px-2 py-1 rounded-md text-[#8E8EA0] hover:text-[#F2F2F5] transition-colors"
              style={{ background: '#1E1E24' }}
            >
              {copied ? '복사됨 ✓' : '복사'}
            </button>
          )}
          <button
            onClick={handleGenerate}
            disabled={!metrics || status === 'loading'}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all disabled:opacity-40"
            style={{ background: '#7C6AF7', color: 'white' }}
          >
            {status === 'loading' ? '분석 중...' : status === 'done' ? '재분석' : 'AI 분석 시작'}
          </button>
        </div>
      </div>

      {!metrics ? (
        <p className="text-sm text-[#52525E] text-center py-8">
          리포트를 먼저 업로드해주세요
        </p>
      ) : !insights ? (
        <p className="text-sm text-[#52525E] text-center py-8">
          AI 분석 시작 버튼을 눌러 인사이트를 확인하세요
        </p>
      ) : (
        <div
          className="text-sm text-[#8E8EA0] leading-relaxed whitespace-pre-wrap"
          style={{ minHeight: 100 }}
        >
          {insights}
          {status === 'loading' && (
            <span className="inline-block w-1.5 h-4 bg-[#7C6AF7] ml-0.5 animate-pulse" />
          )}
        </div>
      )}
    </div>
  )
}
