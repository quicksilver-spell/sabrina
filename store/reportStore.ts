'use client'
import { create } from 'zustand'
import { NormalizedReportRow, ReportSummary, PlatformMetrics } from '@/lib/types/report.types'
import { Platform } from '@/lib/types/platform.types'

interface PlatformReport {
  rawFile: File | null
  rows: NormalizedReportRow[]
  summary: ReportSummary | null
  status: 'idle' | 'parsing' | 'done' | 'error'
  error: string | null
}

const defaultReport = (): PlatformReport => ({
  rawFile: null,
  rows: [],
  summary: null,
  status: 'idle',
  error: null,
})

type ImprovementStatus = 'idle' | 'loading' | 'done' | 'error'
interface ImprovementState {
  status: ImprovementStatus
  text: string
}

interface ReportStore {
  reports: Record<Platform, PlatformReport>
  activePlatform: Platform
  metrics: Record<Platform, PlatformMetrics | null>
  insights: Record<Platform, string>
  insightStatus: Record<Platform, 'idle' | 'loading' | 'done' | 'error'>
  improvements: Record<Platform, Record<string, ImprovementState>>
  setActivePlatform: (p: Platform) => void
  setReport: (platform: Platform, rows: NormalizedReportRow[], summary: ReportSummary) => void
  setReportStatus: (platform: Platform, status: PlatformReport['status'], error?: string) => void
  setMetrics: (platform: Platform, metrics: PlatformMetrics) => void
  setInsightStatus: (platform: Platform, status: 'idle' | 'loading' | 'done' | 'error') => void
  appendInsightChunk: (platform: Platform, chunk: string) => void
  clearInsight: (platform: Platform) => void
  clearReport: (platform: Platform) => void
  setImprovementStatus: (platform: Platform, rowId: string, status: ImprovementStatus) => void
  appendImprovementChunk: (platform: Platform, rowId: string, chunk: string) => void
  clearImprovement: (platform: Platform, rowId: string) => void
}

export const useReportStore = create<ReportStore>((set) => ({
  reports: {
    meta: defaultReport(),
    google: defaultReport(),
    naver: defaultReport(),
  },
  activePlatform: 'meta',
  metrics: { meta: null, google: null, naver: null },
  insights: { meta: '', google: '', naver: '' },
  insightStatus: { meta: 'idle', google: 'idle', naver: 'idle' },
  improvements: { meta: {}, google: {}, naver: {} },

  setActivePlatform: (p) => set({ activePlatform: p }),

  setReport: (platform, rows, summary) =>
    set((s) => ({
      reports: {
        ...s.reports,
        [platform]: { ...s.reports[platform], rows, summary, status: 'done', error: null },
      },
    })),

  setReportStatus: (platform, status, error) =>
    set((s) => ({
      reports: {
        ...s.reports,
        [platform]: { ...s.reports[platform], status, error: error ?? null },
      },
    })),

  setMetrics: (platform, metrics) =>
    set((s) => ({ metrics: { ...s.metrics, [platform]: metrics } })),

  setInsightStatus: (platform, status) =>
    set((s) => ({ insightStatus: { ...s.insightStatus, [platform]: status } })),

  appendInsightChunk: (platform, chunk) =>
    set((s) => ({ insights: { ...s.insights, [platform]: s.insights[platform] + chunk } })),

  clearInsight: (platform) =>
    set((s) => ({
      insights: { ...s.insights, [platform]: '' },
      insightStatus: { ...s.insightStatus, [platform]: 'idle' },
    })),

  clearReport: (platform) =>
    set((s) => ({
      reports: { ...s.reports, [platform]: defaultReport() },
      metrics: { ...s.metrics, [platform]: null },
    })),

  setImprovementStatus: (platform, rowId, status) =>
    set((s) => ({
      improvements: {
        ...s.improvements,
        [platform]: {
          ...s.improvements[platform],
          [rowId]: { status, text: s.improvements[platform][rowId]?.text ?? '' },
        },
      },
    })),

  appendImprovementChunk: (platform, rowId, chunk) =>
    set((s) => ({
      improvements: {
        ...s.improvements,
        [platform]: {
          ...s.improvements[platform],
          [rowId]: {
            status: s.improvements[platform][rowId]?.status ?? 'loading',
            text: (s.improvements[platform][rowId]?.text ?? '') + chunk,
          },
        },
      },
    })),

  clearImprovement: (platform, rowId) =>
    set((s) => ({
      improvements: {
        ...s.improvements,
        [platform]: {
          ...s.improvements[platform],
          [rowId]: { status: 'idle', text: '' },
        },
      },
    })),
}))
