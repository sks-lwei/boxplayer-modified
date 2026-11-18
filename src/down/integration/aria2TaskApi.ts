// aria2 Task API 已禁用 —— 保留函数签名让现有调用方可编译
// 所有异步方法返回空结果或 null
// @deprecated aria2 功能已从本版本移除

import type { DownloadTask, DownloadTaskFile, DownloadGlobalStat } from './taskTypes'

export interface MagnetPreview {
  metadataGid?: string
  taskGid?: string
  name: string
  files: DownloadTaskFile[]
}

export interface PrepareMagnetOptions {}

export async function discardMagnetPreview(_preview?: Pick<MagnetPreview, 'metadataGid' | 'taskGid'> | null): Promise<void> {}
export async function prepareMagnetFiles(_magnet: string, _dir: string, _options: PrepareMagnetOptions = {}): Promise<MagnetPreview> { return { name: '', files: [] } }
export const buildSelectFileOption = (indexes: number[]): { 'select-file': string } => ({ 'select-file': indexes.join(',') })
export const normalizeTaskListResult = (tasks: any[] = []): DownloadTask[] => tasks as DownloadTask[]
export async function getTaskStatus(_gid: string): Promise<DownloadTask | null> { return null }
export async function getActiveList(): Promise<DownloadTask[]> { return [] }
export async function getWaitingList(_offset = 0, _num = 200): Promise<DownloadTask[]> { return [] }
export async function getStoppedList(_offset = 0, _num = 200): Promise<DownloadTask[]> { return [] }
export async function getTaskFiles(_gid: string): Promise<DownloadTaskFile[]> { return [] }
export async function changeTaskSelectedFiles(_gid: string, _indexes: number[]): Promise<void> {}
export async function changeTaskOption(_gid: string, _options: Record<string, string>): Promise<void> {}
export async function pauseTask(_gid: string): Promise<void> {}
export async function resumeTask(_gid: string): Promise<void> {}
export async function removeTask(_gid: string): Promise<void> {}
export async function batchPauseTasks(_gids: string[]): Promise<void> {}
export async function batchResumeTasks(_gids: string[]): Promise<void> {}
export async function batchRemoveTasks(_gids: string[]): Promise<void> {}
export async function getGlobalStat(): Promise<DownloadGlobalStat | null> { return null }
export async function changeGlobalOption(_options: Record<string, string>): Promise<void> {}
