'use client'
import { useState } from 'react'
import { NormalizedReportRow } from '@/lib/types/report.types'
import { Platform } from '@/lib/types/platform.types'

interface CreativeTableProps {
  rows: NormalizedReportRow[]
  platform: Platform
}

type SortKey = 'impressions' | 'clicks' | 'ctr' | 'spend' | 'cpc' | 'roas'

export default function CreativeTable({ rows, platform }: CreativeTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('ctr')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const PER_PAGE = 20

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }
  const setDir = (d: 'asc' | 'desc') => setSortDir(d)

  const filtered = rows
    .filter((r) => r.ad.toLowerCase().includes(search.toLowerCase()) || r.campaign.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const av = a[sortKey] ?? 0
      const bv = b[sortKey] ?? 0
      return sortDir === 'desc' ? (bv as number) - (av as number) : (av as number) - (bv as number)
    })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE)

  const fmtKRW = (n: number) => '₩' + Math.round(n).toLocaleString('ko-KR')
  const fmtPct = (n: number) => (n * 100).toFixed(2) + '%'

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (sortDir === 'desc' ? ' ▼' : ' ▲') : ''

  const hasRoas = platform === 'meta' || platform === 'naver'

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#17171A', border: '1px solid #2A2A35' }}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A2A35]">
        <h3 className="text-sm font-medium text-[#F2F2F5]">소재 상세 ({rows.length.toLocaleString()}개)</h3>
        <input
          type="text"
          placeholder="소재명 / 캠페인 검색..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          className="text-xs px-3 py-1.5 rounded-lg outline-none text-[#F2F2F5] placeholder:text-[#52525E] w-56"
          style={{ background: '#0F0F11', border: '1px solid #2A2A35' }}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: '#1E1E24', borderBottom: '1px solid #2A2A35' }}>
              <th className="px-4 py-3 text-left text-[#52525E] font-medium">소재명</th>
              <th className="px-4 py-3 text-left text-[#52525E] font-medium">캠페인</th>
              {['impressions', 'clicks', 'ctr', 'spend', 'cpc', ...(hasRoas ? ['roas'] : [])].map((k) => (
                <th
                  key={k}
                  className="px-4 py-3 text-right text-[#52525E] font-medium cursor-pointer hover:text-[#8E8EA0] whitespace-nowrap"
                  onClick={() => handleSort(k as SortKey)}
                >
                  {k === 'impressions' ? '노출' : k === 'clicks' ? '클릭' : k === 'ctr' ? 'CTR' : k === 'spend' ? '집행금액' : k === 'cpc' ? 'CPC' : 'ROAS'}
                  <SortIcon k={k as SortKey} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => (
              <tr
                key={row.id}
                style={{ borderBottom: '1px solid #1E1E24' }}
                className="hover:bg-[#1E1E24] transition-colors"
              >
                <td className="px-4 py-3 text-[#F2F2F5] max-w-[200px] truncate">{row.ad || '–'}</td>
                <td className="px-4 py-3 text-[#8E8EA0] max-w-[160px] truncate">{row.campaign}</td>
                <td className="px-4 py-3 text-right text-[#8E8EA0]">{row.impressions.toLocaleString('ko-KR')}</td>
                <td className="px-4 py-3 text-right text-[#8E8EA0]">{row.clicks.toLocaleString('ko-KR')}</td>
                <td className="px-4 py-3 text-right text-[#F2F2F5] font-medium">{fmtPct(row.ctr)}</td>
                <td className="px-4 py-3 text-right text-[#8E8EA0]">{fmtKRW(row.spend)}</td>
                <td className="px-4 py-3 text-right text-[#8E8EA0]">{fmtKRW(row.cpc)}</td>
                {hasRoas && (
                  <td className="px-4 py-3 text-right text-[#7C6AF7]">
                    {row.roas ? row.roas.toFixed(2) + 'x' : '–'}
                  </td>
                )}
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-[#52525E]">검색 결과가 없습니다</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#2A2A35]">
          <p className="text-xs text-[#52525E]">
            {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, filtered.length)} / {filtered.length}개
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="w-7 h-7 rounded text-xs text-[#8E8EA0] hover:text-[#F2F2F5] disabled:opacity-30 transition-colors"
              style={{ background: '#1E1E24' }}
            >
              ‹
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="w-7 h-7 rounded text-xs text-[#8E8EA0] hover:text-[#F2F2F5] disabled:opacity-30 transition-colors"
              style={{ background: '#1E1E24' }}
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
