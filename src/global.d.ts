declare global {

  namespace List {
    type Result<T = unknown, D extends object = Record<string, never>> = {
      lists: T[]
      /** 页码 */
      page_no: number
      /** 每页数量 */
      page_size: number
      /** 总数 */
      count: number
      extend: Record<string, unknown>
    } & D

    type Query<T extends object = Record<string, unknown>> = T & {
      page_size?: number
      page_no?: number
      /** 1-正常分页；0-不分页拉最大数量 */
      page_type?: 0 | 1
    }
  }

  interface FileItem {
    url?: string
    status?: 'uploading' | 'success' | 'failed'
    message?: string
    thumb?: string
    response?: unknown
    [key: string]: unknown
  }
}

export {}
