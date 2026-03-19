'use client'
import { useCallback, useState, useRef } from 'react'
import { Platform } from '@/lib/types/platform.types'
import { PLATFORMS } from '@/lib/types/platform.types'
import { useReportStore } from '@/store/reportStore'

interface FileUploadZoneProps {
  platform: Platform
  onParsed?: () => void
}

export default function FileUploadZone({ platform, onParsed }: FileUploadZoneProps) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const store = useReportStore()
  const report = store.reports[platform]
  const config = PLATFORMS[platform]

  const handleFile = useCallback(
    async (file: File) => {
      const allowed = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
      ]
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (!allowed.includes(file.type) && !['csv', 'xlsx', 'xls', 'txt'].includes(ext ?? '')) {
        alert('CSV 또는 XLSX 파일만 업로드 가능합니다')
        return
      }

      store.setReportStatus(platform, 'parsing')

      try {
        const { parseReportFile } = await import('@/lib/client-api/parseReport')
        const data = await parseReportFile(file, platform)
        store.setReport(platform, data.rows, data.metrics.summary)
        store.setMetrics(platform, data.metrics)
        onParsed?.()
      } catch (err) {
        store.setReportStatus(platform, 'error', err instanceof Error ? err.message : '오류 발생')
      }
    },
    [platform, store, onParsed]
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const isParsing = report.status === 'parsing'
  const isDone = report.status === 'done'

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => !isParsing && inputRef.current?.click()}
      className="relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 p-8 text-center select-none"
      style={{
        borderColor: dragging
          ? config.color
          : isDone
          ? '#2A2A35'
          : '#2A2A35',
        background: dragging ? `${config.color}10` : isDone ? '#17171A' : '#17171A',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls,.txt"
        className="hidden"
        onChange={onInputChange}
      />

      {isParsing ? (
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: `${config.color}40`, borderTopColor: config.color }}
          />
          <p className="text-sm text-[#8E8EA0]">파일 분석 중...</p>
        </div>
      ) : isDone && report.summary ? (
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
            style={{ background: config.color }}
          >
            ✓
          </div>
          <p className="text-sm font-medium text-[#F2F2F5]">
            {report.summary.totalRows.toLocaleString()}개 소재 파싱 완료
          </p>
          <p className="text-xs text-[#52525E]">
            클릭해서 다른 파일 업로드
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
            style={{ background: `${config.color}20`, color: config.color }}
          >
            {config.icon}
          </div>
          <div>
            <p className="text-sm font-medium text-[#F2F2F5]">
              {config.name} 리포트 파일 업로드
            </p>
            <p className="text-xs text-[#52525E] mt-1">
              CSV 또는 XLSX 파일을 드래그하거나 클릭해서 선택
            </p>
          </div>
        </div>
      )}

      {report.status === 'error' && (
        <p className="mt-2 text-xs text-red-400">{report.error}</p>
      )}
    </div>
  )
}
