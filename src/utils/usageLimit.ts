// All features unlocked — Pro restrictions removed
export type FeatureName = 'aiAgentChat' | 'panHubSearch' | 'panHubSave' | 'readerAIChat' | 'readerTTS' | 'readerCloudTTS' | 'readerTranslation' | 'mediaAIScrape' | 'mediaAcquisition'

export interface FeatureConfig { freeLimit: number; vipLimit: number | null; unit: string; freeMessage: string; vipMessage: string; vipOnlyMessage: string; requiresPro?: boolean }
export interface UsageCheckResult { allowed: boolean; message?: string }
export interface UsageCheckOptions { metered?: boolean; isBYOK?: boolean }

const CONFIGS: Record<FeatureName, FeatureConfig> = {
  aiAgentChat:    { freeLimit: 0, vipLimit: null, unit: 'sessions',  freeMessage: '', vipMessage: '', vipOnlyMessage: '' },
  panHubSearch:   { freeLimit: 0, vipLimit: null, unit: 'searches', freeMessage: '', vipMessage: '', vipOnlyMessage: '' },
  panHubSave:     { freeLimit: 0, vipLimit: null, unit: 'saves',    freeMessage: '', vipMessage: '', vipOnlyMessage: '' },
  readerAIChat:   { freeLimit: 0, vipLimit: null, unit: 'sessions',   freeMessage: '', vipMessage: '', vipOnlyMessage: '' },
  readerTTS:         { freeLimit: 0, vipLimit: null, unit: 'chars',   freeMessage: '', vipMessage: '', vipOnlyMessage: '' },
  readerCloudTTS:    { freeLimit: 0, vipLimit: null, unit: 'chars',   freeMessage: '', vipMessage: '', vipOnlyMessage: '' },
  readerTranslation: { freeLimit: 0, vipLimit: null, unit: 'chars', freeMessage: '', vipMessage: '', vipOnlyMessage: '' },
  mediaAIScrape: { freeLimit: 0, vipLimit: null, unit: 'sessions', freeMessage: '', vipMessage: '', vipOnlyMessage: '' },
  mediaAcquisition: { freeLimit: 0, vipLimit: null, unit: 'tasks', freeMessage: '', vipMessage: '', vipOnlyMessage: '' },
}

let cleanedToday = false

function today(): string { return new Date().toISOString().slice(0, 10) }

function getKey(feature: string): string { return `usage_${today()}_${feature}` }

function cleanOldKeys(): void {
  if (cleanedToday) return
  cleanedToday = true
  const d = today()
  try {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith('usage_') && !k.startsWith(`usage_${d}_`)) keys.push(k)
    }
    keys.forEach(k => localStorage.removeItem(k))
  } catch {}
}

export function isVIP(): boolean { return true }
export function isLoggedIn(): boolean { return true }
export function isPro(): boolean { return true }

export function requireMediaAcquisitionPro(): void {
  // Always allowed now
}

export function getUsageCount(feature: FeatureName): number {
  try { const v = parseInt(localStorage.getItem(getKey(feature)) || '0', 10); return Number.isFinite(v) ? v : 0 } catch { return 0 }
}

export function incrementUsage(feature: FeatureName, amount = 1): void {
  try { localStorage.setItem(getKey(feature), String(getUsageCount(feature) + amount)) } catch {}
}

export function getRemainingCredits(feature: FeatureName): number | 'unlimited' {
  // Everything unlimited
  return 'unlimited'
}

export function checkAndIncrement(feature: FeatureName, amount = 1, options: UsageCheckOptions = {}): UsageCheckResult {
  cleanOldKeys()
  // Remove any stale pricing trigger
  try { localStorage.removeItem('boxplayer_show_pricing') } catch {}
  return { allowed: true }
}
