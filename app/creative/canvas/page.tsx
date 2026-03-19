'use client'
import dynamic from 'next/dynamic'
import { useState, useRef } from 'react'
import { Platform, PLATFORMS } from '@/lib/types/platform.types'
import { SIZE_CONFIGS } from '@/constants/sizes'
import { SizeConfig, FileNameParts } from '@/lib/types/creative.types'
import FileNamingModal from '@/components/creative/FileNamingModal'
import { useLibraryStore } from '@/store/libraryStore'
import { v4 as uuidv4 } from 'uuid'

const CanvasEditor = dynamic(() => import('@/components/creative/canvas/CanvasEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 text-[#52525E] text-sm">
      <div className="w-5 h-5 rounded-full border-2 border-t-transparent border-[#7C6AF7] animate-spin mr-2" />
      에디터 로딩 중...
    </div>
  ),
})

export default function CanvasPage() {
  const [platform, setPlatform] = useState<Platform>('meta')
  const [selectedSize, setSelectedSize] = useState<SizeConfig | null>(null)
  const [namingOpen, setNamingOpen] = useState(false)
  const [exportedUrl, setExportedUrl] = useState<string | null>(null)
  const exportFnRef = useRef<(() => string | undefined) | null>(null)
  const library = useLibraryStore()

  const sizes = SIZE_CONFIGS.filter((s) => s.platform === platform && !s.isVideo)

  const handleExportClick = () => {
    setNamingOpen(true)
  }

  const handleNamingConfirm = async (filename: string, parts: FileNameParts) => {
    // Trigger canvas export
    const dataUrl = exportFnRef.current?.()
    if (!dataUrl) return

    // Add to library
    library.addItem({
      id: uuidv4(),
      filename,
      medium: parts.medium,
      type: parts.type,
      width: parts.width,
      height: parts.height,
      creativeType: parts.creativeType,
      contentDesc: parts.contentDesc,
      thumbnail: dataUrl,
      source: 'app',
      createdAt: new Date().toISOString(),
      platform,
    })

    // Download
    const link = document.createElement('a')
    link.download = filename + '.png'
    link.href = dataUrl
    link.click()
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Platform + Size selector */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {(['meta', 'google', 'naver'] as Platform[]).map((p) => {
            const cfg = PLATFORMS[p]
            return (
              <button
                key={p}
                onClick={() => { setPlatform(p); setSelectedSize(null) }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: platform === p ? `${cfg.color}20` : '#17171A',
                  border: `1px solid ${platform === p ? cfg.color : '#2A2A35'}`,
                  color: platform === p ? cfg.color : '#8E8EA0',
                }}
              >
                {cfg.name}
              </button>
            )
          })}
        </div>
        <div className="flex gap-2 flex-wrap">
          {sizes.map((s) => {
            const active = selectedSize?.width === s.width && selectedSize?.height === s.height
            return (
              <button
                key={`${s.width}x${s.height}`}
                onClick={() => setSelectedSize(s)}
                className="px-2.5 py-1.5 rounded-lg text-xs transition-all"
                style={{
                  background: active ? '#7C6AF720' : '#17171A',
                  border: `1px solid ${active ? '#7C6AF7' : '#2A2A35'}`,
                  color: active ? '#9D8FFF' : '#8E8EA0',
                }}
              >
                {s.width}×{s.height}
              </button>
            )
          })}
        </div>
        {selectedSize && (
          <button
            onClick={handleExportClick}
            className="ml-auto px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: '#7C6AF7', color: 'white' }}
          >
            내보내기 & 다운로드
          </button>
        )}
      </div>

      {/* Canvas */}
      {selectedSize ? (
        <div
          className="rounded-xl p-4"
          style={{ background: '#17171A', border: '1px solid #2A2A35' }}
        >
          <CanvasEditor
            size={selectedSize}
            onExport={(dataUrl) => setExportedUrl(dataUrl)}
          />
        </div>
      ) : (
        <div
          className="rounded-xl p-16 text-center"
          style={{ background: '#17171A', border: '1px dashed #2A2A35' }}
        >
          <p className="text-sm text-[#52525E]">위에서 사이즈를 선택해주세요</p>
        </div>
      )}

      <FileNamingModal
        open={namingOpen}
        onClose={() => setNamingOpen(false)}
        onConfirm={handleNamingConfirm}
        initialPlatform={platform}
        initialWidth={selectedSize?.width}
        initialHeight={selectedSize?.height}
        initialType="IMG"
      />
    </div>
  )
}
