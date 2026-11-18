// aria2c 已禁用 —— 所有 RPC 调用降级为 no-op，让现有引用保持可编译。
// 如需下载功能，请使用 BoxPlayer 内置下载管理器。
// @deprecated aria2 功能已从本版本移除

export const localPwd = ''

export function IsAria2cRemote() { return false }
export function IsAria2cLocal() { return false }
export function IsAria2cEnabled() { return false }
export function SetAriaOnline(_online: boolean, _state: 'local' | 'remote' = 'local') {}
export function bindAriaErrorListener(_engine: any, _ariaState: 'local' | 'remote', _onDisconnect?: (state: 'local' | 'remote') => void) {}

export async function AriaTest(_https: boolean, _host: string, _port: number, _secret: string) { return false }
export async function AriaChangeToRemote() { return false }
export async function AriaChangeToLocal() { return false }
export async function AriaGlobalSpeed() { return null }
export async function AriaApplyAdvancedOptions() { return false }
export async function AriaConnect() { return false }
export async function AriaGetDowningList() { return [] }
export async function AriaDeleteList(_list: string[]) {}
export async function AriaStopList(_list: string[]) {}
export function AriaShoutDown() {}
export async function AriaRawCall(_method: string, ..._args: any[]): Promise<any> { return null }
export async function AriaAddUrl(_file: any): Promise<string> { return '' }
export function AriaHashFile(_downitem: any) { return { DownID: '', Check: false } }
export function FormatAriaError(_code: string, _message: string): string { return '' }
