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

interface ReportStore {
  reports: Record<Platform, PlatformReport>
  activePlatform: Platform
  metrics: Record<Platform, PlatformMetrics | null>
  insights: Record<Platform, string>
  insightStatus: Record<Platform, 'idle' | 'loading' | 'done' | 'error'>
  setActivePlatform: (p: Platform) => void
  setReport: (platform: Platform, rows: NormalizedReportRow[], summary: ReportSummary) => void
  setReportStatus: (platform: Platform, status: PlatformReport['status'], error?: string) => void
  setMetrics: (platform: Platform, metrics: PlatformMetrics) => void
  setInsightStatus: (platform: Platform, status: 'idle' | 'loading' | 'done' | 'error') => void
  appendInsightChunk: (platform: Platform, chunk: string) => void
  clearInsight: (platform: Platform) => void
  clearReport: (platform: Platform) => void
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
}))
