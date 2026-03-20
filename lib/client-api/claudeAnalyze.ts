'use client'
import { PlatformMetrics } from '@/lib/types/report.types'
import { buildAnalysisPrompt } from '@/lib/analyzers/claude-prompt-builder'
import { getApiKey } from './apiKeys'

export async function streamClaudeText(
  prompt: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void
) {
  const apiKey = getApiKey('anthropic')
  if (!apiKey) {
    onError('Anthropic API 키가 설정되지 않았습니다. 설정 페이지에서 입력해주세요.')
    return
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 1500,
        stream: true,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      onError('API 오류: ' + err.slice(0, 100))
      return
    }

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const lines = decoder.decode(value).split('\n')
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        if (data === '[DONE]') continue
        try {
          const parsed = JSON.parse(data)
          if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
            onChunk(parsed.delta.text)
          }
        } catch {}
      }
    }
    onDone()
  } catch (err) {
    onError(err instanceof Error ? err.message : '알 수 없는 오류')
  }
}

export async function streamClaudeAnalysis(
  metrics: PlatformMetrics,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void
) {
  const prompt = buildAnalysisPrompt(metrics)
  return streamClaudeText(prompt, onChunk, onDone, onError)
}
