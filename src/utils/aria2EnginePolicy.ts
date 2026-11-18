// aria2c 引擎策略已禁用 —— 下载由内置下载管理器接管
// @deprecated aria2 功能已从本版本移除

export const normalizeAria2cEnabled = (_value: unknown): boolean => false
export const shouldUseNativeDownloadManager = (): boolean => true
