'use client'
import { useState, useEffect } from 'react'
import { Platform, PLATFORMS } from '@/lib/types/platform.types'
import { CreativeMediaType, FileNameParts } from '@/lib/types/creative.types'
import { SIZE_CONFIGS, CREATIVE_TYPES } from '@/constants/sizes'
import { buildFileName, sanitizeContentDesc, validateFileName } from '@/lib/creative/file-namer'

interface FileNamingModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (filename: string, parts: FileNameParts) => void
  initialPlatform?: Platform
  initialWidth?: number
  initialHeight?: number
  initialType?: CreativeMediaType
}

const STEPS = ['매체 선택', '파일 유형', '사이즈', '크리에이티브 타입', '콘텐츠 설명']

export default function FileNamingModal({
  open,
  onClose,
  onConfirm,
  initialPlatform,
  initialWidth,
  initialHeight,
  initialType,
}: FileNamingModalProps) {
  const [step, setStep] = useState(0)
  const [parts, setParts] = useState<Partial<FileNameParts>>({
    medium: initialPlatform ? (initialPlatform.toUpperCase() as FileNameParts['medium']) : undefined,
    type: initialType,
    width: initialWidth,
    height: initialHeight,
  })

  useEffect(() => {
    if (open) {
      setStep(0)
      setParts({
        medium: initialPlatform ? (initialPlatform.toUpperCase() as FileNameParts['medium']) : undefined,
        type: initialType,
        width: initialWidth,
        height: initialHeight,
      })
    }
  }, [open, initialPlatform, initialType, initialWidth, initialHeight])

  if (!open) return null

  const setPart = <K extends keyof FileNameParts>(key: K, val: FileNameParts[K]) =>
    setParts((p) => ({ ...p, [key]: val }))

  const preview = parts.medium && parts.type && parts.width && parts.height && parts.creativeType
    ? buildFileName(parts as FileNameParts)
    : '–'

  const canProceed = () => {
    if (step === 0) return !!parts.medium
    if (step === 1) return !!parts.type
    if (step === 2) return !!(parts.width && parts.height)
    if (step === 3) return !!parts.creativeType
    if (step === 4) return (parts.contentDesc?.trim().length ?? 0) >= 2
    return false
  }

  const handleConfirm = () => {
    const errors = validateFileName(parts)
    if (errors.length) return alert(errors.join('\n'))
    onConfirm(buildFileName(parts as FileNameParts), parts as FileNameParts)
    onClose()
  }

  const platform = parts.medium?.toLowerCase() as Platform | undefined
  const sizes = platform
    ? SIZE_CONFIGS.filter((s) => s.platform === platform && (parts.type === 'VIDEO' ? s.isVideo : !s.isVideo))
    : []
  const creativeTypes = platform
    ? Object.entries(CREATIVE_TYPES).filter(([, v]) => v.platforms.includes(platform))
    : []

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden animate-slide-up"
        style={{ background: '#17171A', border: '1px solid #2A2A35' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2A35]">
          <div>
            <h2 className="text-sm font-semibold text-[#F2F2F5]">파일명 빌더</h2>
            <p className="text-xs text-[#52525E] mt-0.5">UTM Content 파라미터 = 파일명</p>
          </div>
          <button onClick={onClose} className="text-[#52525E] hover:text-[#F2F2F5] text-lg">✕</button>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-0 px-6 py-3 border-b border-[#2A2A35]">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <button
                onClick={() => i < step && setStep(i)}
                className={`text-xs px-0 py-1 rounded transition-colors ${
                  i === step
                    ? 'text-[#9D8FFF] font-medium'
                    : i < step
                    ? 'text-[#7C6AF7] cursor-pointer'
                    : 'text-[#52525E] cursor-default'
                }`}
              >
                {i + 1}. {s}
              </button>
              {i < STEPS.length - 1 && <span className="text-[#2A2A35] mx-2 text-xs">›</span>}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 min-h-[200px]">
          {step === 0 && (
            <div className="grid grid-cols-3 gap-3">
              {(['META', 'GOOGLE', 'NAVER'] as const).map((m) => {
                const cfg = PLATFORMS[m.toLowerCase() as Platform]
                return (
                  <button
                    key={m}
                    onClick={() => setPart('medium', m)}
                    className="p-4 rounded-xl text-center transition-all"
                    style={{
                      background: parts.medium === m ? `${cfg.color}20` : '#1E1E24',
                      border: `1px solid ${parts.medium === m ? cfg.color : '#2A2A35'}`,
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center font-bold text-white text-sm" style={{ background: cfg.color }}>
                      {cfg.icon}
                    </div>
                    <p className="text-sm font-medium text-[#F2F2F5]">{cfg.name}</p>
                  </button>
                )
              })}
            </div>
          )}

          {step === 1 && (
            <div className="grid grid-cols-3 gap-3">
              {(['IMG', 'VIDEO', 'GIF'] as CreativeMediaType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setPart('type', t)}
                  className="p-4 rounded-xl text-center transition-all"
                  style={{
                    background: parts.type === t ? '#7C6AF720' : '#1E1E24',
                    border: `1px solid ${parts.type === t ? '#7C6AF7' : '#2A2A35'}`,
                  }}
                >
                  <p className="text-2xl mb-1">{t === 'IMG' ? '🖼' : t === 'VIDEO' ? '🎬' : '⚡'}</p>
                  <p className="text-sm font-medium text-[#F2F2F5]">{t}</p>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto">
              {sizes.length === 0 ? (
                <p className="col-span-2 text-center text-sm text-[#52525E] py-8">매체와 유형을 먼저 선택해주세요</p>
              ) : (
                sizes.map((s) => {
                  const active = parts.width === s.width && parts.height === s.height
                  return (
                    <button
                      key={`${s.width}x${s.height}`}
                      onClick={() => { setPart('width', s.width); setPart('height', s.height) }}
                      className="flex items-center gap-3 p-3 rounded-lg text-left transition-all"
                      style={{
                        background: active ? '#7C6AF720' : '#1E1E24',
                        border: `1px solid ${active ? '#7C6AF7' : '#2A2A35'}`,
                      }}
                    >
                      <span className="text-xs font-mono text-[#7C6AF7]">{s.width}×{s.height}</span>
                      <span className="text-xs text-[#8E8EA0]">{s.label}</span>
                    </button>
                  )
                })
              )}
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-2 gap-2">
              {creativeTypes.map(([key, val]) => {
                const active = parts.creativeType === key
                return (
                  <button
                    key={key}
                    onClick={() => setPart('creativeType', key)}
                    className="p-3 rounded-lg text-left transition-all"
                    style={{
                      background: active ? '#7C6AF720' : '#1E1E24',
                      border: `1px solid ${active ? '#7C6AF7' : '#2A2A35'}`,
                    }}
                  >
                    <p className="text-sm font-medium text-[#F2F2F5]">{key}</p>
                    <p className="text-xs text-[#52525E]">{val.label}</p>
                  </button>
                )
              })}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#8E8EA0] block mb-2">콘텐츠 설명 (영문/한글, 최대 40자)</label>
                <input
                  type="text"
                  placeholder="예: SUMMER_SALE, 브랜드_인지도, PRODUCT_LAUNCH"
                  value={parts.contentDesc ?? ''}
                  onChange={(e) => setPart('contentDesc', e.target.value)}
                  maxLength={60}
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-[#F2F2F5] placeholder:text-[#52525E] outline-none"
                  style={{ background: '#0F0F11', border: '1px solid #2A2A35' }}
                />
                <p className="text-xs text-[#52525E] mt-1">
                  실제 파일명에서: {sanitizeContentDesc(parts.contentDesc ?? '')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="px-6 py-3 border-t border-[#2A2A35]" style={{ background: '#0F0F11' }}>
          <p className="text-xs text-[#52525E] mb-1">파일명 미리보기</p>
          <p className="text-sm font-mono text-[#7C6AF7] truncate">{preview}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#2A2A35]">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : onClose()}
            className="text-sm text-[#8E8EA0] hover:text-[#F2F2F5] transition-colors"
          >
            {step > 0 ? '이전' : '취소'}
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => canProceed() && setStep(step + 1)}
              disabled={!canProceed()}
              className="text-sm px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-40"
              style={{ background: '#7C6AF7', color: 'white' }}
            >
              다음
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={!canProceed()}
              className="text-sm px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-40"
              style={{ background: '#7C6AF7', color: 'white' }}
            >
              파일명 확정
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
