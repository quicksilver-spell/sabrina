'use client'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { parseMetaCsv } from '@/lib/parsers/meta-parser'
import { parseGoogleCsv } from '@/lib/parsers/google-parser'
import { parseNaverRows } from '@/lib/parsers/naver-parser'
import { calculateMetrics } from '@/lib/analyzers/metrics-calculator'
import { Platform } from '@/lib/types/platform.types'

export async function parseReportFile(file: File, platform: Platform) {
  const arrayBuffer = await file.arrayBuffer()
  const filename = file.name.toLowerCase()
  let rows: Record<string, string | number>[] = []

  if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
  } else {
    const text = new TextDecoder('utf-8').decode(arrayBuffer)
    const result = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
    })
    rows = result.data
  }

  let normalized
  if (platform === 'meta') {
    normalized = parseMetaCsv(rows as Record<string, string>[])
  } else if (platform === 'google') {
    normalized = parseGoogleCsv(rows as Record<string, string>[])
  } else {
    normalized = parseNaverRows(rows)
  }

  const metrics = calculateMetrics(normalized, platform)
  return { rows: normalized, metrics }
}
