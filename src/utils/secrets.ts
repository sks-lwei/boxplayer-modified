// 运行时 secrets 访问器 —— 优先从 settingStore 读取用户在"设置-接入配置"里填写的值，
// fallback 到构建期 secrets.generated.ts 里生成的静态值。
//
// 使用方式：
//   import { getSecret, setSecret } from '../utils/secrets'
//   const baiduClientId = getSecret('BAIDU_APP_ID')

import * as compiled from '../secrets.generated'
import useSettingStore from '../setting/settingstore'

const _writable = compiled as Record<string, string>
const runtime: Record<string, string> = {}

// 从 compiled 里提取所有已知的 key —— 让 TS 知道有哪些合法键
export type SecretKey = keyof typeof compiled & string

export function getSecret(key: SecretKey): string {
  // 1. 运行时内存缓存（热路径）
  if (runtime[key] !== undefined && runtime[key] !== '') return runtime[key]
  // 2. settingStore 持久化值
  try {
    const store = useSettingStore()
    const storeVal = (store as any).runtimeSecrets?.[key]
    if (typeof storeVal === 'string' && storeVal !== '') {
      runtime[key] = storeVal
      return storeVal
    }
  } catch {
    // settingStore 尚未初始化（极早期 import 场景），静默跳过
  }
  // 3. fallback：编译时 secrets.generated.ts 静态值
  const staticVal = _writable[key]
  if (typeof staticVal === 'string' && staticVal !== '') {
    runtime[key] = staticVal
    return staticVal
  }
  return ''
}

export function getSecrets(keys: SecretKey[]): Record<SecretKey, string> {
  const out: Record<string, string> = {}
  for (const k of keys) out[k] = getSecret(k)
  return out as Record<SecretKey, string>
}

// 写入 settingStore —— 页面上保存时调用
export function setSecret(key: SecretKey, value: string) {
  runtime[key] = value
  try {
    const store = useSettingStore()
    const current = { ...((store as any).runtimeSecrets || {}) }
    current[key] = value
    store.updateStore({ runtimeSecrets: current } as any)
  } catch {
    // settingStore 尚未初始化，仅写内存
  }
}

export function setSecrets(pairs: Partial<Record<SecretKey, string>>) {
  for (const k of Object.keys(pairs) as SecretKey[]) {
    const v = pairs[k] ?? ''
    runtime[k] = v
  }
  try {
    const store = useSettingStore()
    const current = { ...((store as any).runtimeSecrets || {}) }
    for (const k of Object.keys(pairs)) {
      current[k] = pairs[k as SecretKey] ?? ''
    }
    store.updateStore({ runtimeSecrets: current } as any)
  } catch {
    // settingStore 尚未初始化
  }
}

// 供 SettingSecrets.vue 调用 —— 拿到所有 key 及其当前显示值
export interface SecretEntry {
  key: SecretKey
  label: string        // 显示名（中文）
  group: string        // 所属平台分组
  type: 'client_id' | 'client_secret' | 'token' | 'other'
  hint?: string        // 填写提示
}

export const SECRET_REGISTRY: SecretEntry[] = [
  // 百度网盘
  { key: 'BAIDU_APP_ID',       group: '百度网盘', label: 'Client ID / AppKey',   type: 'client_id',     hint: '百度开放平台 OAuth 应用的 API Key' },
  { key: 'BAIDU_APP_SECRET',   group: '百度网盘', label: 'Client Secret',        type: 'client_secret', hint: '百度开放平台 OAuth 应用的 Secret Key' },
  { key: 'BAIDU_PCS_APP_ID',   group: '百度网盘', label: 'PCS AppID (可选)',     type: 'client_id',     hint: '老版 PCS 接口整数 AppID，一般留空' },

  // 阿里云盘
  { key: 'ALIYUN_APP_ID',      group: '阿里云盘', label: 'Client ID / AppKey',   type: 'client_id',     hint: '阿里云盘开放平台应用 ID' },
  { key: 'ALIYUN_APP_SECRET',  group: '阿里云盘', label: 'Client Secret',        type: 'client_secret' },

  // 123 云盘
  { key: 'CLOUD123_APP_ID',    group: '123 云盘', label: 'Client ID',            type: 'client_id' },
  { key: 'CLOUD123_APP_SECRET',group: '123 云盘', label: 'Client Secret',        type: 'client_secret' },

  // 115 网盘
  { key: 'DRIVE115_APP_ID',    group: '115 网盘', label: 'Client ID',            type: 'client_id' },
  { key: 'DRIVE115_APP_SECRET',group: '115 网盘', label: 'Client Secret',        type: 'client_secret' },

  // 夸克 / PikPak
  { key: 'PIKPAK_CLIENT_ID',   group: '夸克网盘', label: 'Client ID',            type: 'client_id' },
  { key: 'PIKPAK_CLIENT_SECRET',group: '夸克网盘',label: 'Client Secret',        type: 'client_secret' },

  // 189 云盘
  { key: 'CLOUD189_APP_ID',    group: '189 云盘', label: 'Client ID',            type: 'client_id' },

  // OneDrive
  { key: 'ONEDRIVE_CLIENT_ID',    group: 'OneDrive',   label: 'Client ID',         type: 'client_id',     hint: 'Microsoft Azure AD 应用程序 (client UUID)' },
  { key: 'ONEDRIVE_CLIENT_SECRET',group: 'OneDrive',   label: 'Client Secret',     type: 'client_secret' },

  // Box
  { key: 'BOX_CLIENT_ID',       group: 'Box',        label: 'Client ID',          type: 'client_id' },
  { key: 'BOX_CLIENT_SECRET',   group: 'Box',        label: 'Client Secret',     type: 'client_secret' },

  // Dropbox
  { key: 'DROPBOX_APP_KEY',     group: 'Dropbox',    label: 'App Key',            type: 'client_id' },
  { key: 'DROPBOX_APP_SECRET',  group: 'Dropbox',    label: 'App Secret',        type: 'client_secret' },

  // Google
  { key: 'GOOGLE_CLIENT_ID',       group: 'Google',   label: 'Client ID',          type: 'client_id' },
  { key: 'GOOGLE_CLIENT_SECRET',   group: 'Google',   label: 'Client Secret',     type: 'client_secret' },
  { key: 'GOOGLE_BOOKS_API_TOKEN', group: 'Google',   label: 'Books API Token',    type: 'token' },

  // 广亚（文献）
  { key: 'GUANGYA_CLIENT_ID',   group: '广亚文献', label: 'Client ID',           type: 'client_id' },

  // 字幕 / TMDB / Trakt
  { key: 'SUBTITLE_SEARCH_API_KEY',  group: '字幕 API',   label: '字幕搜索 API Key',  type: 'token' },
  { key: 'SUBTITLE_DOWNLOAD_API_KEY',group: '字幕 API',   label: '字幕下载 API Key',  type: 'token' },
  { key: 'TMDB_API_KEY',              group: '影视元数据', label: 'TMDB API Key',      type: 'token' },
  { key: 'TRAKT_CLIENT_ID',          group: '影视元数据', label: 'Trakt Client ID',  type: 'client_id' },

  // 内部服务 / 统计
  { key: 'BOXPLAYER_SITE_URL',           group: '内部服务', label: 'Site URL',              type: 'other' },
  { key: 'BOXPLAYER_SUPABASE_URL',       group: '内部服务', label: 'Supabase URL',          type: 'other' },
  { key: 'SUPABASE_PUBLISHABLE_KEY',     group: '内部服务', label: 'Supabase Publish Key',  type: 'token' },
  { key: 'POSTHOG_HOST',                 group: '内部服务', label: 'PostHog Host',          type: 'other' },
  { key: 'POSTHOG_PROJECT_API_KEY',      group: '内部服务', label: 'PostHog API Key',       type: 'token' },

  // Apple
  { key: 'APPLE_ID',              group: 'Apple', label: 'Apple ID',              type: 'other' },
  { key: 'APPLE_PASSWORD',        group: 'Apple', label: 'Password',              type: 'client_secret' },
  { key: 'APPLE_TEAM_ID',         group: 'Apple', label: 'Team ID',               type: 'other' },
]
