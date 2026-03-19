'use client'
import { useState } from 'react'
import { Platform, PLATFORMS } from '@/lib/types/platform.types'
import { SIZE_CONFIGS } from '@/constants/sizes'
import { SizeConfig, FileNameParts, GeneratedImage } from '@/lib/types/creative.types'
import FileNamingModal from '@/components/creative/FileNamingModal'
import { useLibraryStore } from '@/store/libraryStore'
import { v4 as uuidv4 } from 'uuid'

const STYLE_PRESETS = ['사진 실사', '일러스트', '미니멀', '대담한', '소프트', '네온']

export default function AIGeneratePage() {
  const [platform, setPlatform] = useState<Platform>('meta')
  const [selectedSize, setSelectedSize] = useState<SizeConfig | null>(null)
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('')
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [error, setError] = useState('')
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)
  const [namingOpen, setNamingOpen] = useState(false)
  const library = useLibraryStore()

  const sizes = SIZE_CONFIGS.filter((s) => s.platform === platform && !s.isVideo)

  const handleGenerate = async () => {
    if (!prompt.trim() || !selectedSize) return
    setLoading(true)
    setError('')
    try {
      const { generateImage } = await import('@/lib/client-api/dalleGenerate')
      const data = await generateImage({
        prompt,
        platform,
        width: selectedSize.width,
        height: selectedSize.height,
        style,
      })
      const img: GeneratedImage = {
        id: uuidv4(),
        url: data.imageUrl,
        prompt: data.revisedPrompt || prompt,
        width: selectedSize.width,
        height: selectedSize.height,
        platform,
        createdAt: new Date().toISOString(),
      }
      setImages((prev) => [img, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : '생성 오류')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadClick = (img: GeneratedImage) => {
    setSelectedImage(img)
    setNamingOpen(true)
  }

  const handleNamingConfirm = async (filename: string, parts: FileNameParts) => {
    if (!selectedImage) return
    // Download image
    const res = await fetch(selectedImage.url)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = filename + '.png'
    link.href = url
    link.click()
    URL.revokeObjectURL(url)

    library.addItem({
      id: uuidv4(),
      filename,
      medium: parts.medium,
      type: 'IMG',
      width: selectedImage.width,
      height: selectedImage.height,
      creativeType: parts.creativeType,
      contentDesc: parts.contentDesc,
      thumbnail: selectedImage.url,
      source: 'app',
      createdAt: selectedImage.createdAt,
      platform: selectedImage.platform,
    })
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Platform + Size */}
      <div className="flex flex-wrap gap-3">
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
      </div>

      {/* Prompt */}
      <div className="rounded-xl p-5 space-y-4" style={{ background: '#17171A', border: '1px solid #2A2A35' }}>
        <div>
          <label className="text-xs text-[#8E8EA0] block mb-2">광고 프롬프트</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="예: 여름 시즌 특가 할인 광고, 시원한 바다 배경, 밝고 활기찬 분위기"
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg text-sm text-[#F2F2F5] placeholder:text-[#52525E] outline-none resize-none"
            style={{ background: '#0F0F11', border: '1px solid #2A2A35' }}
          />
        </div>
        <div>
          <label className="text-xs text-[#8E8EA0] block mb-2">스타일 (선택)</label>
          <div className="flex flex-wrap gap-2">
            {STYLE_PRESETS.map((s) => (
              <button
                key={s}
                onClick={() => setStyle(style === s ? '' : s)}
                className="px-2.5 py-1 rounded-full text-xs transition-all"
                style={{
                  background: style === s ? '#7C6AF720' : '#1E1E24',
                  border: `1px solid ${style === s ? '#7C6AF7' : '#2A2A35'}`,
                  color: style === s ? '#9D8FFF' : '#8E8EA0',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim() || !selectedSize}
          className="w-full py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
          style={{ background: '#7C6AF7', color: 'white' }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              생성 중...
            </span>
          ) : 'AI 이미지 생성'}
        </button>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      {/* Results */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="rounded-xl overflow-hidden group"
              style={{ background: '#17171A', border: '1px solid #2A2A35' }}
            >
              <div className="relative aspect-square overflow-hidden">
                <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleDownloadClick(img)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{ background: '#7C6AF7', color: 'white' }}
                  >
                    다운로드
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs text-[#52525E] truncate">{img.width}×{img.height}</p>
                <p className="text-xs text-[#8E8EA0] truncate mt-0.5">{img.prompt.slice(0, 60)}...</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <FileNamingModal
        open={namingOpen}
        onClose={() => setNamingOpen(false)}
        onConfirm={handleNamingConfirm}
        initialPlatform={platform}
        initialWidth={selectedImage?.width}
        initialHeight={selectedImage?.height}
        initialType="IMG"
      />
    </div>
  )
}
