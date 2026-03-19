'use client'
import { useState, useRef } from 'react'
import { Platform, PLATFORMS } from '@/lib/types/platform.types'
import { SIZE_CONFIGS } from '@/constants/sizes'
import { SizeConfig, FileNameParts } from '@/lib/types/creative.types'
import FileNamingModal from '@/components/creative/FileNamingModal'
import { useLibraryStore } from '@/store/libraryStore'
import { v4 as uuidv4 } from 'uuid'

interface TemplateSlots {
  headline: string
  subtext: string
  cta: string
  bgColor: string
  accentColor: string
  textColor: string
}

const TEMPLATES = [
  {
    id: 'minimal-dark',
    name: '미니멀 다크',
    desc: '깔끔한 다크 테마',
    preview: { bg: '#0F0F11', accent: '#7C6AF7' },
  },
  {
    id: 'bold-color',
    name: '볼드 컬러',
    desc: '강렬한 컬러 배경',
    preview: { bg: '#1877F2', accent: '#ffffff' },
  },
  {
    id: 'gradient',
    name: '그라데이션',
    desc: '부드러운 그라데이션',
    preview: { bg: '#7C6AF7', accent: '#FFD700' },
  },
  {
    id: 'product',
    name: '제품 중심',
    desc: '제품명 강조',
    preview: { bg: '#F8F8F8', accent: '#333' },
  },
]

export default function TemplatePage() {
  const [platform, setPlatform] = useState<Platform>('meta')
  const [selectedSize, setSelectedSize] = useState<SizeConfig | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [slots, setSlots] = useState<TemplateSlots>({
    headline: '헤드라인을 입력하세요',
    subtext: '서브 텍스트를 입력하세요',
    cta: '지금 확인하기',
    bgColor: '#0F0F11',
    accentColor: '#7C6AF7',
    textColor: '#ffffff',
  })
  const [namingOpen, setNamingOpen] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const library = useLibraryStore()

  const sizes = SIZE_CONFIGS.filter((s) => s.platform === platform && !s.isVideo)

  const handleExport = async (filename: string, parts: FileNameParts) => {
    if (!previewRef.current) return
    const { default: html2canvas } = await import('html2canvas')
    const canvas = await html2canvas(previewRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
    })
    const dataUrl = canvas.toDataURL('image/png')

    library.addItem({
      id: uuidv4(),
      filename,
      medium: parts.medium,
      type: 'IMG',
      width: parts.width,
      height: parts.height,
      creativeType: parts.creativeType,
      contentDesc: parts.contentDesc,
      thumbnail: dataUrl,
      source: 'app',
      createdAt: new Date().toISOString(),
      platform,
    })

    const link = document.createElement('a')
    link.download = filename + '.png'
    link.href = dataUrl
    link.click()
  }

  const scale = selectedSize
    ? Math.min(400 / selectedSize.width, 300 / selectedSize.height)
    : 1

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
        {/* Template gallery + editor */}
        <div className="space-y-4">
          <div>
            <p className="text-xs text-[#8E8EA0] mb-3">템플릿 선택</p>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTemplate(t.id)
                    setSlots((s) => ({ ...s, bgColor: t.preview.bg, accentColor: t.preview.accent }))
                  }}
                  className="p-3 rounded-xl text-left transition-all"
                  style={{
                    background: selectedTemplate === t.id ? '#7C6AF720' : '#1E1E24',
                    border: `1px solid ${selectedTemplate === t.id ? '#7C6AF7' : '#2A2A35'}`,
                  }}
                >
                  <div className="w-full h-10 rounded-lg mb-2 flex items-center justify-center" style={{ background: t.preview.bg }}>
                    <div className="w-8 h-2 rounded" style={{ background: t.preview.accent }} />
                  </div>
                  <p className="text-xs font-medium text-[#F2F2F5]">{t.name}</p>
                  <p className="text-xs text-[#52525E]">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Slot editor */}
          <div className="rounded-xl p-4 space-y-3" style={{ background: '#17171A', border: '1px solid #2A2A35' }}>
            <p className="text-xs text-[#8E8EA0] font-medium">텍스트 편집</p>
            {[
              { key: 'headline', label: '헤드라인' },
              { key: 'subtext', label: '서브텍스트' },
              { key: 'cta', label: 'CTA 버튼' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-xs text-[#52525E]">{label}</label>
                <input
                  type="text"
                  value={slots[key as keyof TemplateSlots]}
                  onChange={(e) => setSlots((s) => ({ ...s, [key]: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 rounded-lg text-xs text-[#F2F2F5] outline-none"
                  style={{ background: '#0F0F11', border: '1px solid #2A2A35' }}
                />
              </div>
            ))}
            <div className="flex gap-3">
              {[
                { key: 'bgColor', label: '배경색' },
                { key: 'accentColor', label: '포인트색' },
                { key: 'textColor', label: '텍스트색' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={slots[key as keyof TemplateSlots]}
                    onChange={(e) => setSlots((s) => ({ ...s, [key]: e.target.value }))}
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                  <span className="text-xs text-[#52525E]">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {selectedSize && selectedTemplate && (
            <button
              onClick={() => setNamingOpen(true)}
              className="w-full py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{ background: '#7C6AF7', color: 'white' }}
            >
              PNG 다운로드
            </button>
          )}
        </div>

        {/* Preview */}
        <div className="rounded-xl p-5 flex items-center justify-center" style={{ background: '#17171A', border: '1px solid #2A2A35' }}>
          {selectedSize ? (
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
              <div
                ref={previewRef}
                style={{
                  width: selectedSize.width,
                  height: selectedSize.height,
                  background: slots.bgColor,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: Math.max(20, selectedSize.width * 0.05),
                  fontFamily: 'Arial, sans-serif',
                  gap: 16,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Decorative element */}
                <div style={{
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: selectedSize.width * 0.4,
                  height: selectedSize.width * 0.4,
                  borderRadius: '50%',
                  background: `${slots.accentColor}20`,
                }} />
                <div style={{
                  width: 40,
                  height: 4,
                  background: slots.accentColor,
                  borderRadius: 2,
                }} />
                <h1 style={{
                  fontSize: Math.max(24, selectedSize.width * 0.04),
                  fontWeight: 700,
                  color: slots.textColor,
                  textAlign: 'center',
                  margin: 0,
                }}>
                  {slots.headline}
                </h1>
                <p style={{
                  fontSize: Math.max(14, selectedSize.width * 0.022),
                  color: `${slots.textColor}99`,
                  textAlign: 'center',
                  margin: 0,
                }}>
                  {slots.subtext}
                </p>
                <div style={{
                  background: slots.accentColor,
                  color: slots.bgColor,
                  padding: '10px 24px',
                  borderRadius: 8,
                  fontSize: Math.max(13, selectedSize.width * 0.018),
                  fontWeight: 600,
                }}>
                  {slots.cta}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#52525E]">사이즈를 선택하면 미리보기가 표시됩니다</p>
          )}
        </div>
      </div>

      <FileNamingModal
        open={namingOpen}
        onClose={() => setNamingOpen(false)}
        onConfirm={handleExport}
        initialPlatform={platform}
        initialWidth={selectedSize?.width}
        initialHeight={selectedSize?.height}
        initialType="IMG"
      />
    </div>
  )
}
