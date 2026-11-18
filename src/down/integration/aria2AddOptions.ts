// aria2 AddOptions helper 已禁用 —— 保留签名让调用方可编译
// @deprecated aria2 功能已从本版本移除

export interface BuildAriaAddOptionsInput {
  urls?: string[]; dir?: string; split?: number; pieceLength?: number
  allowOverwrite?: boolean; retryWait?: number; maxConnectionPerServer?: number
  torrentFile?: string; gid?: string
}

export const buildAriaAddOptions = (input: BuildAriaAddOptionsInput): Record<string, any> => ({
  dir: input.dir,
  split: input.split ?? 5,
  'max-connection-per-server': input.maxConnectionPerServer ?? 5,
})
export const shouldCheckExistingDownloadTarget = (_sourceType: string): boolean => false
export const resolveProviderDownloadSplit = (_provider: string, configuredSplit: number): number => configuredSplit || 5
