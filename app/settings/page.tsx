'use client'
import { useState, useEffect } from 'react'
import { getApiKey, setApiKey, clearApiKey } from '@/lib/client-api/apiKeys'

interface KeyState {
  value: string
  saved: boolean
  visible: boolean
}

export default function SettingsPage() {
  const [anthropic, setAnthropic] = useState<KeyState>({ value: '', saved: false, visible: false })
  const [openai, setOpenai] = useState<KeyState>({ value: '', saved: false, visible: false })

  useEffect(() => {
    const ak = getApiKey('anthropic')
    const ok = getApiKey('openai')
    setAnthropic((s) => ({ ...s, value: ak, saved: !!ak }))
    setOpenai((s) => ({ ...s, value: ok, saved: !!ok }))
  }, [])

  const handleSave = (key: 'anthropic' | 'openai') => {
    const val = key === 'anthropic' ? anthropic.value : openai.value
    if (val.trim()) {
      setApiKey(key, val.trim())
      if (key === 'anthropic') setAnthropic((s) => ({ ...s, saved: true }))
      else setOpenai((s) => ({ ...s, saved: true }))
    }
  }

  const handleClear = (key: 'anthropic' | 'openai') => {
    clearApiKey(key)
    if (key === 'anthropic') setAnthropic({ value: '', saved: false, visible: false })
    else setOpenai({ value: '', saved: false, visible: false })
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h2 className="text-base font-semibold text-[#F2F2F5] mb-1">API 키 설정</h2>
        <p className="text-sm text-[#52525E]">
          API 키는 브라우저 localStorage에만 저장되며 외부로 전송되지 않습니다.
        </p>
      </div>

      {/* Anthropic */}
      <div className="rounded-xl p-5 space-y-4" style={{ background: '#17171A', border: '1px solid #2A2A35' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ background: '#7C6AF720', color: '#7C6AF7' }}
          >
            ✦
          </div>
          <div>
            <h3 className="text-sm font-medium text-[#F2F2F5]">Anthropic API 키</h3>
            <p className="text-xs text-[#52525E]">Claude AI 인사이트 분석에 사용</p>
          </div>
          {anthropic.saved && (
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: '#03C75A20', color: '#03C75A' }}>
              저장됨
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={anthropic.visible ? 'text' : 'password'}
              value={anthropic.value}
              onChange={(e) => setAnthropic((s) => ({ ...s, value: e.target.value, saved: false }))}
              placeholder="sk-ant-..."
              className="w-full px-3 py-2 rounded-lg text-sm text-[#F2F2F5] placeholder:text-[#52525E] outline-none pr-10"
              style={{ background: '#0F0F11', border: '1px solid #2A2A35' }}
            />
            <button
              onClick={() => setAnthropic((s) => ({ ...s, visible: !s.visible }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#52525E] hover:text-[#8E8EA0]"
            >
              {anthropic.visible ? '숨김' : '표시'}
            </button>
          </div>
          <button
            onClick={() => handleSave('anthropic')}
            disabled={!anthropic.value.trim()}
            className="px-4 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
            style={{ background: '#7C6AF7', color: 'white' }}
          >
            저장
          </button>
          {anthropic.saved && (
            <button
              onClick={() => handleClear('anthropic')}
              className="px-3 py-2 rounded-lg text-xs text-[#8E8EA0] hover:text-red-400 transition-colors"
              style={{ background: '#1E1E24' }}
            >
              삭제
            </button>
          )}
        </div>
        <p className="text-xs text-[#52525E]">
          Anthropic Console → API Keys 에서 발급:{' '}
          <span className="text-[#7C6AF7]">console.anthropic.com</span>
        </p>
      </div>

      {/* OpenAI */}
      <div className="rounded-xl p-5 space-y-4" style={{ background: '#17171A', border: '1px solid #2A2A35' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: '#10A37F20', color: '#10A37F' }}
          >
            ⬡
          </div>
          <div>
            <h3 className="text-sm font-medium text-[#F2F2F5]">OpenAI API 키</h3>
            <p className="text-xs text-[#52525E]">DALL-E 3 AI 이미지 생성에 사용</p>
          </div>
          {openai.saved && (
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: '#03C75A20', color: '#03C75A' }}>
              저장됨
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={openai.visible ? 'text' : 'password'}
              value={openai.value}
              onChange={(e) => setOpenai((s) => ({ ...s, value: e.target.value, saved: false }))}
              placeholder="sk-..."
              className="w-full px-3 py-2 rounded-lg text-sm text-[#F2F2F5] placeholder:text-[#52525E] outline-none pr-10"
              style={{ background: '#0F0F11', border: '1px solid #2A2A35' }}
            />
            <button
              onClick={() => setOpenai((s) => ({ ...s, visible: !s.visible }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#52525E] hover:text-[#8E8EA0]"
            >
              {openai.visible ? '숨김' : '표시'}
            </button>
          </div>
          <button
            onClick={() => handleSave('openai')}
            disabled={!openai.value.trim()}
            className="px-4 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
            style={{ background: '#7C6AF7', color: 'white' }}
          >
            저장
          </button>
          {openai.saved && (
            <button
              onClick={() => handleClear('openai')}
              className="px-3 py-2 rounded-lg text-xs text-[#8E8EA0] hover:text-red-400 transition-colors"
              style={{ background: '#1E1E24' }}
            >
              삭제
            </button>
          )}
        </div>
        <p className="text-xs text-[#52525E]">
          OpenAI Platform → API Keys 에서 발급:{' '}
          <span className="text-[#10A37F]">platform.openai.com</span>
        </p>
      </div>

      {/* Notice */}
      <div className="rounded-xl p-4" style={{ background: '#1E1E24', border: '1px solid #2A2A35' }}>
        <p className="text-xs text-[#8E8EA0] leading-relaxed">
          ⚠️ API 키는 브라우저의 localStorage에 저장됩니다. 공용 컴퓨터에서는 사용 후 반드시 삭제해주세요.
          이 앱은 API 키를 서버로 전송하지 않으며, 모든 API 호출은 브라우저에서 직접 이루어집니다.
        </p>
      </div>
    </div>
  )
}
