import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { parseMetaCsv } from '@/lib/parsers/meta-parser'
import { parseGoogleCsv } from '@/lib/parsers/google-parser'
import { parseNaverRows } from '@/lib/parsers/naver-parser'
import { calculateMetrics } from '@/lib/analyzers/metrics-calculator'
import { Platform } from '@/lib/types/platform.types'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const platform = formData.get('platform') as Platform | null

    if (!file || !platform) {
      return NextResponse.json({ error: '파일과 매체를 선택해주세요' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = file.name.toLowerCase()

    let rows: Record<string, string | number>[] = []

    if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
    } else if (filename.endsWith('.csv') || filename.endsWith('.txt')) {
      const text = buffer.toString('utf-8')
      const result = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
      })
      rows = result.data
    } else {
      return NextResponse.json({ error: 'CSV 또는 XLSX 파일만 지원합니다' }, { status: 400 })
    }

    // Parse by platform
    let normalized
    if (platform === 'meta') {
      normalized = parseMetaCsv(rows as Record<string, string>[])
    } else if (platform === 'google') {
      normalized = parseGoogleCsv(rows as Record<string, string>[])
    } else if (platform === 'naver') {
      normalized = parseNaverRows(rows)
    } else {
      return NextResponse.json({ error: '지원하지 않는 매체입니다' }, { status: 400 })
    }

    const metrics = calculateMetrics(normalized, platform)

    return NextResponse.json({
      rows: normalized,
      metrics,
      summary: {
        totalRows: normalized.length,
        platform,
        detectedColumns: rows.length > 0 ? Object.keys(rows[0]) : [],
      },
    })
  } catch (err) {
    console.error('parse-report error:', err)
    return NextResponse.json({ error: '파일 파싱 중 오류가 발생했습니다' }, { status: 500 })
  }
}
