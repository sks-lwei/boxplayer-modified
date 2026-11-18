// aria2 RPC helper 已禁用 —— 保留函数签名让调用方可编译
// @deprecated aria2 功能已从本版本移除

export const getAriaAddUriGid = (result: unknown): string => ''
export const callAriaClient = async (_method: string, ..._args: any[]): Promise<any> => null
export const isAriaDuplicateGidError = (_error: unknown): boolean => false
export const shouldRemoveAriaStoppedResult = (_status: string): boolean => false
