'use client'
import { useState, useCallback, useMemo } from 'react'
import { useReportStore } from '@/store/reportStore'
import { useLibraryStore } from '@/store/libraryStore'
import { matchCreatives, getUnusedCreatives } from '@/lib/creative/matcher'
import { Platform, PLATFORMS } from '@/lib/types/platform.types'
import { MatchResult, CreativeLibraryItem } from '@/lib/types/creative.types'
import { parseFileName } from '@/lib/creative/file-namer'
import { v4 as uuidv4 } from 'uuid'
import Link from 'next/link'

type FilterStatus = 'all' | 'matched' | 'partial' | 'missing' | 'unused'

export default function MatchingPage() {
  const reportStore = useReportStore()
  const library = useLibraryStore()
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterPlatform, setFilterPlatform] = useState<Platform | 'all'>('all')
  const [dragging, setDragging] = useState(false)

  // Collect all report rows across platforms
  const allRows = useMemo(() => {
    return (['meta', 'google', 'naver'] as Platform[]).flatMap(
      (p) => reportStore.reports[p].rows
    )
  }, [reportStore.reports])

  const matchResults = useMemo(
    () => matchCreatives(allRows, library.items),
    [allRows, library.items]
  )

  const unusedCreatives = useMemo(
    () => getUnusedCreatives(allRows, library.items),
    [allRows, library.items]
  )

  const stats = useMemo(() => {
    const matched = matchResults.filter((r) => r.status === 'matched').length
    const partial = matchResults.filter((r) => r.status === 'partial').length
    const missing = matchResults.filter((r) => r.status === 'missing').length
    return { matched, partial, missing, unused: unusedCreatives.length, total: matchResults.length }
  }, [matchResults, unusedCreatives])

  const filtered = useMemo(() => {
    if (filterStatus === 'unused') return []
    return matchResults.filter((r) => {
      if (filterStatus !== 'all' && r.status !== filterStatus) return false
      if (filterPlatform !== 'all' && r.platform !== filterPlatform) return false
      return true
    })
  }, [matchResults, filterStatus, filterPlatform])

  // Handle file drop for library import
  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const files = Array.from(e.dataTransfer.files)
      for (const file of files) {
        const ext = file.name.split('.').pop()?.toLowerCase()
        if (!['png', 'jpg', 'jpeg', 'gif', 'webp', 'mp4', 'webm'].includes(ext ?? '')) continue

        const isVideo = ['mp4', 'webm'].includes(ext ?? '')
        const parts = parseFileName(file.name)
        const thumbnail = isVideo ? '' : await fileToDataUrl(file)

        library.addItem({
          id: uuidv4(),
          filename: file.name.replace(/\.[^.]+$/, ''),
          medium: parts?.medium ?? 'META',
          type: isVideo ? 'VIDEO' : 'IMG',
          width: parts?.width ?? 0,
          height: parts?.height ?? 0,
          creativeType: parts?.creativeType ?? '',
          contentDesc: parts?.contentDesc ?? '',
          thumbnail,
          source: 'local',
          createdAt: new Date().toISOString(),
          fileSize: file.size,
          platform: (parts?.medium?.toLowerCase() as Platform) ?? 'meta',
        })
      }
    },
    [library]
  )

  const exportCsv = () => {
    const rows = [
      ['소재명', '매체', '캠페인', '노출', '클릭', 'CTR', '집행금액', 'ROAS', '매칭 상태', '매칭 파일명'],
      ...matchResults.map((r) => [
        r.adName,
        r.platform,
        r.campaign,
        r.impressions,
        r.clicks,
        (r.ctr * 100).toFixed(2) + '%',
        Math.round(r.spend),
        r.roas?.toFixed(2) ?? '',
        r.status === 'matched' ? '매칭됨' : r.status === 'partial' ? '부분 매칭' : '미제작',
        r.exact?.filename ?? r.partial[0]?.filename ?? '',
      ]),
    ]
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = '소재매칭결과.csv'
    link.href = url
    link.click()
  }

  const statusConfig = {
    matched: { label: '매칭됨', color: '#03C75A', bg: '#03C75A15' },
    partial: { label: '부분 매칭', color: '#F59E0B', bg: '#F59E0B15' },
    missing: { label: '미제작', color: '#EF4444', bg: '#EF444415' },
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: '전체 소재', value: stats.total, color: '#7C6AF7' },
          { label: '매칭됨', value: stats.matched, color: '#03C75A' },
          { label: '부분 매칭', value: stats.partial, color: '#F59E0B' },
          { label: '미제작', value: stats.missing, color: '#EF4444' },
          { label: '미사용', value: stats.unused, color: '#52525E' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: '#17171A', border: '1px solid #2A2A35' }}>
            <p className="text-xs text-[#52525E]">{s.label}</p>
            <p className="text-2xl font-semibold mt-1" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Library Import Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className="rounded-xl border-2 border-dashed p-6 text-center transition-all"
        style={{
          borderColor: dragging ? '#7C6AF7' : '#2A2A35',
          background: dragging ? '#7C6AF710' : '#17171A',
        }}
      >
        <p className="text-sm text-[#52525E]">
          기존 크리에이티브 파일을 여기에 드래그해서 라이브러리에 추가 (이미지/동영상)
        </p>
        <p className="text-xs text-[#52525E] mt-1">라이브러리 항목: {library.items.length}개</p>
      </div>

      {/* Filters + Export */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5">
          {(['all', 'matched', 'partial', 'missing', 'unused'] as FilterStatus[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className="px-2.5 py-1.5 rounded-lg text-xs transition-all"
              style={{
                background: filterStatus === f ? '#7C6AF720' : '#17171A',
                border: `1px solid ${filterStatus === f ? '#7C6AF7' : '#2A2A35'}`,
                color: filterStatus === f ? '#9D8FFF' : '#8E8EA0',
              }}
            >
              {f === 'all' ? '전체' : f === 'matched' ? '매칭됨' : f === 'partial' ? '부분' : f === 'missing' ? '미제작' : '미사용'}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {(['all', 'meta', 'google', 'naver'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setFilterPlatform(p)}
              className="px-2.5 py-1.5 rounded-lg text-xs transition-all"
              style={{
                background: filterPlatform === p ? '#1E1E24' : 'transparent',
                border: `1px solid ${filterPlatform === p ? '#2A2A35' : 'transparent'}`,
                color: filterPlatform === p ? '#F2F2F5' : '#52525E',
              }}
            >
              {p === 'all' ? '전체 매체' : PLATFORMS[p].name}
            </button>
          ))}
        </div>
        <button
          onClick={exportCsv}
          disabled={matchResults.length === 0}
          className="ml-auto text-xs px-3 py-1.5 rounded-lg transition-all disabled:opacity-40"
          style={{ background: '#1E1E24', border: '1px solid #2A2A35', color: '#8E8EA0' }}
        >
          CSV 내보내기
        </button>
      </div>

      {/* Matching Table */}
      {filterStatus === 'unused' ? (
        <UnusedCreativesView items={unusedCreatives} />
      ) : (
        <MatchingTable results={filtered} />
      )}
    </div>
  )
}

function MatchingTable({ results }: { results: MatchResult[] }) {
  if (results.length === 0) {
    return (
      <div className="rounded-xl p-16 text-center" style={{ background: '#17171A', border: '1px solid #2A2A35' }}>
        <p className="text-sm text-[#52525E]">
          {results.length === 0 ? '리포트를 먼저 업로드해주세요' : '검색 결과가 없습니다'}
        </p>
      </div>
    )
  }

  const statusConfig: Record<string, { label: string; color: string }> = {
    matched: { label: '매칭됨', color: '#03C75A' },
    partial: { label: '부분 매칭', color: '#F59E0B' },
    missing: { label: '미제작', color: '#EF4444' },
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#17171A', border: '1px solid #2A2A35' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: '#1E1E24', borderBottom: '1px solid #2A2A35' }}>
              <th className="px-4 py-3 text-left text-[#52525E] font-medium">소재명 (utm_content)</th>
              <th className="px-4 py-3 text-left text-[#52525E] font-medium">매체</th>
              <th className="px-4 py-3 text-right text-[#52525E] font-medium">CTR</th>
              <th className="px-4 py-3 text-right text-[#52525E] font-medium">집행금액</th>
              <th className="px-4 py-3 text-center text-[#52525E] font-medium">상태</th>
              <th className="px-4 py-3 text-left text-[#52525E] font-medium">매칭 파일</th>
              <th className="px-4 py-3 text-center text-[#52525E] font-medium">액션</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => {
              const sc = statusConfig[r.status]
              const matchedFile = r.exact ?? r.partial[0]
              return (
                <tr key={i} style={{ borderBottom: '1px solid #1E1E24' }} className="hover:bg-[#1E1E24] transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-[#F2F2F5] font-mono text-xs truncate max-w-[200px]">{r.adName || '–'}</p>
                    <p className="text-[#52525E] truncate max-w-[200px]">{r.campaign}</p>
                  </td>
                  <td className="px-4 py-3 text-[#8E8EA0]">{PLATFORMS[r.platform].name}</td>
                  <td className="px-4 py-3 text-right text-[#F2F2F5]">{(r.ctr * 100).toFixed(2)}%</td>
                  <td className="px-4 py-3 text-right text-[#8E8EA0]">₩{Math.round(r.spend).toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs"
                      style={{ background: `${sc.color}20`, color: sc.color }}
                    >
                      {sc.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {matchedFile ? (
                      <div className="flex items-center gap-2">
                        {matchedFile.thumbnail && (
                          <img src={matchedFile.thumbnail} alt="" className="w-8 h-8 rounded object-cover" />
                        )}
                        <span className="text-[#8E8EA0] font-mono truncate max-w-[120px]">{matchedFile.filename}</span>
                      </div>
                    ) : (
                      <span className="text-[#52525E]">–</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {r.status === 'missing' && (
                      <Link
                        href={`/creative?prefill=${encodeURIComponent(r.adName)}`}
                        className="text-xs px-2 py-1 rounded-lg transition-all"
                        style={{ background: '#7C6AF720', color: '#9D8FFF', border: '1px solid #7C6AF740' }}
                      >
                        제작하기
                      </Link>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function UnusedCreativesView({ items }: { items: CreativeLibraryItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl p-12 text-center" style={{ background: '#17171A', border: '1px solid #2A2A35' }}>
        <p className="text-sm text-[#52525E]">미사용 소재가 없습니다</p>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-xl overflow-hidden" style={{ background: '#17171A', border: '1px solid #2A2A35' }}>
          {item.thumbnail ? (
            <img src={item.thumbnail} alt={item.filename} className="w-full aspect-square object-cover" />
          ) : (
            <div className="w-full aspect-square flex items-center justify-center text-2xl" style={{ background: '#1E1E24' }}>
              🎬
            </div>
          )}
          <div className="p-2">
            <p className="text-xs text-[#8E8EA0] font-mono truncate">{item.filename}</p>
            <p className="text-xs text-[#52525E]">{item.width}×{item.height}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.readAsDataURL(file)
  })
}
