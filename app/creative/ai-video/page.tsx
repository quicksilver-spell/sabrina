'use client'
import { useState } from 'react'
import { Platform, PLATFORMS } from '@/lib/types/platform.types'
import { SIZE_CONFIGS } from '@/constants/sizes'
import { SizeConfig } from '@/lib/types/creative.types'

export default function AIVideoPage() {
  const [platform, setPlatform] = useState<Platform>('meta')
  const [selectedSize, setSelectedSize] = useState<SizeConfig | null>(null)
  const [prompt, setPrompt] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [mode, setMode] = useState<'text' | 'image'>('text')

  const sizes = SIZE_CONFIGS.filter((s) => s.platform === platform && s.isVideo)

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

      {/* API Key Notice */}
      <div
        className="rounded-xl p-5"
        style={{ background: '#17171A', border: '1px solid #2A2A35' }}
      >
        <div className="flex items-start gap-3 mb-5">
          <span className="text-2xl">🎥</span>
          <div>
            <h3 className="text-sm font-semibold text-[#F2F2F5]">AI 동영상 생성</h3>
            <p className="text-xs text-[#8E8EA0] mt-1">
              RunwayML Gen-3 또는 Pika Labs API를 통해 텍스트 또는 이미지로 동영상을 생성합니다.
            </p>
          </div>
        </div>

        <div
          className="rounded-lg p-4 mb-5"
          style={{ background: '#1E1E24', border: '1px solid #F59E0B40' }}
        >
          <p className="text-xs text-[#F59E0B] font-medium mb-1">⚠️ API 키 설정 필요</p>
          <p className="text-xs text-[#8E8EA0]">
            .env.local 파일에 <code className="text-[#9D8FFF]">RUNWAY_API_KEY</code> 또는{' '}
            <code className="text-[#9D8FFF]">PIKA_API_KEY</code>를 설정해주세요.
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('text')}
            className="px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{
              background: mode === 'text' ? '#7C6AF720' : '#1E1E24',
              border: `1px solid ${mode === 'text' ? '#7C6AF7' : '#2A2A35'}`,
              color: mode === 'text' ? '#9D8FFF' : '#8E8EA0',
            }}
          >
            텍스트 → 동영상
          </button>
          <button
            onClick={() => setMode('image')}
            className="px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{
              background: mode === 'image' ? '#7C6AF720' : '#1E1E24',
              border: `1px solid ${mode === 'image' ? '#7C6AF7' : '#2A2A35'}`,
              color: mode === 'image' ? '#9D8FFF' : '#8E8EA0',
            }}
          >
            이미지 → 동영상
          </button>
        </div>

        {mode === 'text' ? (
          <div>
            <label className="text-xs text-[#8E8EA0] block mb-2">동영상 프롬프트</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="예: 시원한 여름 바다에서 제품을 즐기는 장면, 카메라가 부드럽게 줌인"
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg text-sm text-[#F2F2F5] placeholder:text-[#52525E] outline-none resize-none"
              style={{ background: '#0F0F11', border: '1px solid #2A2A35' }}
            />
          </div>
        ) : (
          <div>
            <label className="text-xs text-[#8E8EA0] block mb-2">기준 이미지 업로드</label>
            <div
              className="rounded-lg border-2 border-dashed p-8 text-center cursor-pointer"
              style={{ borderColor: '#2A2A35' }}
              onClick={() => document.getElementById('img-upload')?.click()}
            >
              {imageFile ? (
                <p className="text-sm text-[#F2F2F5]">{imageFile.name}</p>
              ) : (
                <p className="text-sm text-[#52525E]">이미지 파일을 선택하세요</p>
              )}
            </div>
            <input
              id="img-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
          </div>
        )}

        <button
          disabled={true}
          className="w-full mt-4 py-2.5 rounded-lg text-sm font-medium opacity-40"
          style={{ background: '#EC4899', color: 'white' }}
        >
          동영상 생성 (API 키 설정 후 사용 가능)
        </button>
      </div>

      {/* Instructions */}
      <div className="rounded-xl p-5" style={{ background: '#17171A', border: '1px solid #2A2A35' }}>
        <h4 className="text-sm font-medium text-[#F2F2F5] mb-3">연동 방법</h4>
        <ol className="space-y-2">
          {[
            'RunwayML (runwayml.com) 또는 Pika Labs (pika.art) 계정 생성',
            'API 키 발급 후 .env.local에 RUNWAY_API_KEY 또는 PIKA_API_KEY 설정',
            '/api/generate-video 라우트에 해당 API 연동 코드 추가',
            '동영상 생성 후 FileNamingModal로 파일명 규칙 적용 및 다운로드',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-xs text-[#8E8EA0]">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5"
                style={{ background: '#7C6AF720', color: '#9D8FFF' }}
              >
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
