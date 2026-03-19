import { Platform } from './platform.types'

export interface NormalizedReportRow {
  id: string
  platform: Platform
  campaign: string
  adSet?: string
  ad: string
  impressions: number
  clicks: number
  ctr: number
  spend: number
  cpc: number
  cpm?: number
  conversions?: number
  convRate?: number
  roas?: number
  date?: string
  rawRow: Record<string, string>
}

export interface ReportSummary {
  totalRows: number
  totalImpressions: number
  totalClicks: number
  totalSpend: number
  avgCtr: number
  avgCpc: number
  avgRoas?: number
  dateRange?: { from: string; to: string }
  detectedColumns: string[]
  platform: Platform
}

export interface PlatformMetrics {
  summary: ReportSummary
  topCreatives: NormalizedReportRow[]
  bottomCreatives: NormalizedReportRow[]
  campaignBreakdown: { campaign: string; spend: number; clicks: number; ctr: number }[]
}
