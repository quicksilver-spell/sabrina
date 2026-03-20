'use client'
import { useState } from 'react'
import { Platform, PLATFORMS } from '@/lib/types/platform.types'
import { useReportStore } from '@/store/reportStore'
import { NormalizedReportRow } from '@/lib/types/report.types'

function fmtKRW(n: number) {
  if (n >= 1_000_000) return '₩' + (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return '₩' + Math.round(n / 1_000) + 'K'
  return '₩' + Math.round(n).toLocaleString('ko-KR')
}

function CreativeCard({ row, platform }: { row: NormalizedReportRow; platform: Platform }) {
  const store = useReportStore()
  const improvement = store.improvements[platform][row.id]
  const status = improvement?.status ?? 'idle'
  const text = improvement?.text ?? ''
  const [copied, setCopied] = useState(false)
  const config = PLATFORMS[platform]

  const handleRequest = async () => {
    store.clearImprovement(platform, row.id)
    store.setImprovementStatus(platform, row.id, 'loading')
    try {
      const { buildImprovementPrompt } = await import('@/lib/analyzers/improvement-prompt-builder')
      const { streamClaudeText } = await import('@/lib/client-api/claudeAnalyze')
      const prompt = buildImprovementPrompt(row, platform)
      await streamClaudeText(
        prompt,
        (chunk) => store.appendImprovementChunk(platform, row.id, chunk),
        () => store.setImprovementStatus(platform, row.id, 'done'),
        (err) => {
          store.setImprovementStatus(platform, row.id, 'error')
          store.appendImprovementChunk(platform, row.id, '\n\n오류: ' + err)
        }
      )
    } catch (err) {
      store.setImprovementStatus(platform, row.id, 'error')
      store.appendImprovementChunk(platform, row.id, '\n\n오류: ' + (err instanceof Error ? err.message : '알 수 없는 오류'))
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#17171A', border: '1px solid #2A2A35' }}>
      {/* Card header */}
      <div className="flex items-start justify-between gap-3 p-4 border-b border-[#2A2A35]">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#FF444420', color: '#FF6B6B' }}>
              저성과
            </span>
            <span className="text-xs text-[#52525E]">CTR {(row.ctr * 100).toFixed(2)}%</span>
          </div>
          <p className="text-sm font-medium text-[#F2F2F5] truncate" title={row.ad}>{row.ad}</p>
          {row.campaign && <p className="text-xs text-[#52525E] truncate mt-0.5">{row.campaign}</p>}
        </div>

        {/* Stats */}
        <div className="flex gap-3 flex-shrink-0 text-right">
          <div>
            <p className="text-xs text-[#52525E]">CPC</p>
            <p className="text-sm font-medium text-[#F2F2F5]">{fmtKRW(row.cpc)}</p>
          </div>
          <div>
            <p className="text-xs text-[#52525E]">집행금액</p>
            <p className="text-sm font-medium text-[#F2F2F5]">{fmtKRW(row.spend)}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        {status === 'idle' && (
          <button
            onClick={handleRequest}
            className="w-full py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90"
            style={{ background: `${config.color}15`, border: `1px solid ${config.color}40`, color: config.color }}
          >
            ✦ 개선 제안 받기
          </button>
        )}

        {(status === 'loading' || status === 'done' || status === 'error') && (
          <div>
            {text && (
              <div
                className="text-sm text-[#8E8EA0] leading-relaxed whitespace-pre-wrap mb-3"
                style={{ minHeight: 60 }}
              >
                {text}
                {status === 'loading' && (
                  <span className="inline-block w-1.5 h-4 bg-[#7C6AF7] ml-0.5 animate-pulse" />
                )}
              </div>
            )}

            {!text && status === 'loading' && (
              <div className="flex items-center gap-2 py-4">
                <div className="w-4 h-4 border-2 border-[#7C6AF730] border-t-[#7C6AF7] rounded-full animate-spin" />
                <span className="text-xs text-[#52525E]">Claude가 분석 중...</span>
              </div>
            )}

            <div className="flex gap-2">
              {status === 'done' && text && (
                <button
                  onClick={handleCopy}
                  className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                  style={{ background: '#1E1E24', color: copied ? '#03C75A' : '#8E8EA0' }}
                >
                  {copied ? '복사됨 ✓' : '복사'}
                </button>
              )}
              {(status === 'done' || status === 'error') && (
                <button
                  onClick={handleRequest}
                  className="text-xs px-3 py-1.5 rounded-lg transition-colors text-[#8E8EA0] hover:text-[#F2F2F5]"
                  style={{ background: '#1E1E24' }}
                >
                  재요청
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CreativeImprovementPanel({ platform }: { platform: Platform }) {
  const store = useReportStore()
  const metrics = store.metrics[platform]
  const [expanded, setExpanded] = useState(true)

  if (!metrics || metrics.bottomCreatives.length === 0) return null

  const bottomRows: NormalizedReportRow[] = metrics.bottomCreatives.slice(0, 5)

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#17171A', border: '1px solid #2A2A35' }}>
      {/* Panel header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#1E1E2410] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">⚡</span>
          <h3 className="text-sm font-medium text-[#F2F2F5]">AI 소재 개선 제안</h3>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#FF444415', color: '#FF6B6B' }}>
            저성과 {bottomRows.length}개
          </span>
        </div>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          className="text-[#52525E] transition-transform"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-[#2A2A35] pt-4">
          <p className="text-xs text-[#52525E]">
            CTR 하위 소재에 대해 Claude가 문제를 진단하고 카피 대안 및 비주얼 제안을 생성합니다.
          </p>
          {bottomRows.map((row) => (
            <CreativeCard key={row.id} row={row} platform={platform} />
          ))}
        </div>
      )}
    </div>
  )
}
