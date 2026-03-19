'use client'
import { useState, useRef, useCallback } from 'react'
import { Platform, PLATFORMS } from '@/lib/types/platform.types'
import { SIZE_CONFIGS } from '@/constants/sizes'
import { SizeConfig, FileNameParts } from '@/lib/types/creative.types'
import FileNamingModal from '@/components/creative/FileNamingModal'
import { useLibraryStore } from '@/store/libraryStore'
import { v4 as uuidv4 } from 'uuid'

const VIDEO_TEMPLATES = [
  {
    id: 'text-intro',
    name: '텍스트 인트로',
    desc: '텍스트 fade-in 애니메이션',
    duration: 5,
    icon: '📝',
  },
  {
    id: 'slideshow',
    name: '슬라이드쇼',
    desc: '이미지 슬라이드 전환',
    duration: 10,
    icon: '🖼',
  },
  {
    id: 'logo-outro',
    name: '로고 아웃트로',
    desc: '로고 + CTA 마무리',
    duration: 3,
    icon: '✨',
  },
]

export default function VideoTemplatePage() {
  const [platform, setPlatform] = useState<Platform>('meta')
  const [selectedSize, setSelectedSize] = useState<SizeConfig | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [headline, setHeadline] = useState('브랜드 이름')
  const [subtext, setSubtext] = useState('지금 바로 시작하세요')
  const [bgColor, setBgColor] = useState('#0F0F11')
  const [accentColor, setAccentColor] = useState('#7C6AF7')
  const [recording, setRecording] = useState(false)
  const [namingOpen, setNamingOpen] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const library = useLibraryStore()

  const sizes = SIZE_CONFIGS.filter((s) => s.platform === platform && s.isVideo)

  const renderFrame = useCallback(
    (ctx: CanvasRenderingContext2D, t: number, width: number, height: number) => {
      // Background
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, width, height)

      // Animated accent bar
      const barW = Math.min(width * 0.6 * Math.min(t / 1, 1), width * 0.6)
      ctx.fillStyle = accentColor
      ctx.fillRect((width - width * 0.6) / 2, height / 2 - 3, barW, 6)

      // Headline fade in
      const opacity = Math.min(t / 1.5, 1)
      ctx.globalAlpha = opacity
      ctx.fillStyle = '#ffffff'
      ctx.font = `bold ${Math.max(24, width * 0.05)}px Arial`
      ctx.textAlign = 'center'
      ctx.fillText(headline, width / 2, height / 2 - 40)

      ctx.font = `${Math.max(16, width * 0.03)}px Arial`
      ctx.globalAlpha = Math.min((t - 0.5) / 1.5, 1)
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.fillText(subtext, width / 2, height / 2 + 20)

      ctx.globalAlpha = 1
    },
    [bgColor, accentColor, headline, subtext]
  )

  const handleRecord = useCallback(async () => {
    if (!canvasRef.current || !selectedSize) return
    const canvas = canvasRef.current
    canvas.width = Math.min(selectedSize.width, 600)
    canvas.height = Math.min(selectedSize.height, 600)
    const ctx = canvas.getContext('2d')!

    setRecording(true)
    const duration = 5

    const stream = canvas.captureStream(30)
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' })
    const chunks: Blob[] = []
    recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data)
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      setRecordedBlob(blob)
      setNamingOpen(true)
      setRecording(false)
    }

    recorder.start()
    const startTime = performance.now()
    const animate = () => {
      const elapsed = (performance.now() - startTime) / 1000
      renderFrame(ctx, elapsed, canvas.width, canvas.height)
      if (elapsed < duration) requestAnimationFrame(animate)
      else recorder.stop()
    }
    animate()
  }, [selectedSize, renderFrame])

  const handleNamingConfirm = async (filename: string, parts: FileNameParts) => {
    if (!recordedBlob) return
    const url = URL.createObjectURL(recordedBlob)
    const link = document.createElement('a')
    link.download = filename + '.webm'
    link.href = url
    link.click()
    URL.revokeObjectURL(url)

    library.addItem({
      id: uuidv4(),
      filename,
      medium: parts.medium,
      type: 'VIDEO',
      width: parts.width,
      height: parts.height,
      creativeType: parts.creativeType,
      contentDesc: parts.contentDesc,
      thumbnail: '',
      source: 'app',
      createdAt: new Date().toISOString(),
      platform,
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template + Settings */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {VIDEO_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t.id)}
                className="p-3 rounded-xl text-center transition-all"
                style={{
                  background: selectedTemplate === t.id ? '#7C6AF720' : '#1E1E24',
                  border: `1px solid ${selectedTemplate === t.id ? '#7C6AF7' : '#2A2A35'}`,
                }}
              >
                <p className="text-2xl mb-1">{t.icon}</p>
                <p className="text-xs font-medium text-[#F2F2F5]">{t.name}</p>
                <p className="text-xs text-[#52525E]">{t.duration}초</p>
              </button>
            ))}
          </div>

          <div className="rounded-xl p-4 space-y-3" style={{ background: '#17171A', border: '1px solid #2A2A35' }}>
            {[
              { key: 'headline', label: '헤드라인', value: headline, set: setHeadline },
              { key: 'subtext', label: '서브텍스트', value: subtext, set: setSubtext },
            ].map(({ key, label, value, set }) => (
              <div key={key}>
                <label className="text-xs text-[#52525E]">{label}</label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg text-xs text-[#F2F2F5] outline-none"
                  style={{ background: '#0F0F11', border: '1px solid #2A2A35' }}
                />
              </div>
            ))}
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5">
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                <span className="text-xs text-[#52525E]">배경색</span>
              </div>
              <div className="flex items-center gap-1.5">
                <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                <span className="text-xs text-[#52525E]">포인트색</span>
              </div>
            </div>
          </div>

          {selectedSize && selectedTemplate && (
            <button
              onClick={handleRecord}
              disabled={recording}
              className="w-full py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
              style={{ background: '#F59E0B', color: 'white' }}
            >
              {recording ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  녹화 중... (5초)
                </span>
              ) : 'WebM 동영상 생성 (5초)'}
            </button>
          )}
        </div>

        {/* Canvas preview */}
        <div className="rounded-xl p-5 flex items-center justify-center" style={{ background: '#17171A', border: '1px solid #2A2A35' }}>
          {selectedSize ? (
            <canvas
              ref={canvasRef}
              style={{
                maxWidth: '100%',
                maxHeight: 300,
                borderRadius: 8,
                border: '1px solid #2A2A35',
              }}
            />
          ) : (
            <div className="text-center">
              <p className="text-4xl mb-3">🎬</p>
              <p className="text-sm text-[#52525E]">사이즈를 선택해주세요</p>
            </div>
          )}
        </div>
      </div>

      <FileNamingModal
        open={namingOpen}
        onClose={() => setNamingOpen(false)}
        onConfirm={handleNamingConfirm}
        initialPlatform={platform}
        initialWidth={selectedSize?.width}
        initialHeight={selectedSize?.height}
        initialType="VIDEO"
      />
    </div>
  )
}
