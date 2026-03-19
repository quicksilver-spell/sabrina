'use client'
import { Platform } from '@/lib/types/platform.types'
import { getApiKey } from './apiKeys'

type DalleSize = '1024x1024' | '1792x1024' | '1024x1792'

function getDalleSize(width: number, height: number): DalleSize {
  const ratio = width / height
  if (ratio > 1.5) return '1792x1024'
  if (ratio < 0.67) return '1024x1792'
  return '1024x1024'
}

const platformStyleHints: Record<Platform, string> = {
  meta: 'social media advertisement, clean and engaging, vibrant colors',
  google: 'display advertisement, professional, clear call-to-action, minimal',
  naver: 'Korean digital advertisement, modern, clean design',
}

export async function generateImage(params: {
  prompt: string
  platform: Platform
  width: number
  height: number
  style?: string
}): Promise<{ imageUrl: string; revisedPrompt: string }> {
  const apiKey = getApiKey('openai')
  if (!apiKey) {
    throw new Error('OpenAI API 키가 설정되지 않았습니다. 설정 페이지에서 입력해주세요.')
  }

  const styleHint = platformStyleHints[params.platform]
  const enhancedPrompt = `${params.prompt}. Style: ${styleHint}${params.style ? ', ' + params.style : ''}. High quality, professional advertising creative.`

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: enhancedPrompt,
      size: getDalleSize(params.width, params.height),
      quality: 'hd',
      n: 1,
    }),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error?.message ?? 'DALL-E API 오류')
  }

  const data = await response.json()
  return {
    imageUrl: data.data[0].url,
    revisedPrompt: data.data[0].revised_prompt ?? params.prompt,
  }
}
