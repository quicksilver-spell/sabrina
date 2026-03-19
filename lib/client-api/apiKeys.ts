'use client'

export function getApiKey(key: 'anthropic' | 'openai'): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(`sabrina_${key}_key`) ?? ''
}

export function setApiKey(key: 'anthropic' | 'openai', value: string): void {
  if (typeof window === 'undefined') return
  if (value.trim()) {
    localStorage.setItem(`sabrina_${key}_key`, value.trim())
  } else {
    localStorage.removeItem(`sabrina_${key}_key`)
  }
}

export function clearApiKey(key: 'anthropic' | 'openai'): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(`sabrina_${key}_key`)
}

export function hasApiKey(key: 'anthropic' | 'openai'): boolean {
  return getApiKey(key).length > 0
}
