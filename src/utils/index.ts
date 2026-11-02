import { pages, subPackages } from '@/pages.json'

export function getLastPage() {
  const pageList = getCurrentPages()
  return pageList[pageList.length - 1]
}

/** 安全解码单个路由参数；遇到格式错误时保留原值，避免中断页面跳转。 */
export function ensureDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '))
  }
  catch {
    return value
  }
}

/** 将小程序路由 URL 拆成路径和已解码的 query 参数。 */
export function parseUrlToObj(url: string): { path: string, query: Record<string, string> } {
  /** query 分隔符的位置；路径本身允许为空 query。 */
  const queryStart = url.indexOf('?')
  /** 不含 query 的页面路径。 */
  const path = queryStart === -1 ? url : url.slice(0, queryStart)
  /** 原始 query 字符串，保留值中的后续等号。 */
  const queryStr = queryStart === -1 ? '' : url.slice(queryStart + 1)

  if (!queryStr) {
    return { path, query: {} }
  }

  /** 解码后的路由参数集合。 */
  const query: Record<string, string> = {}
  queryStr.split('&').forEach((item) => {
    if (!item) {
      return
    }
    /** 当前参数中首个键值分隔符的位置。 */
    const separator = item.indexOf('=')
    /** 参数键的原始编码内容。 */
    const key = separator === -1 ? item : item.slice(0, separator)
    /** 参数值的原始编码内容。 */
    const value = separator === -1 ? '' : item.slice(separator + 1)
    query[ensureDecodeURIComponent(key)] = ensureDecodeURIComponent(value)
  })
  return { path, query }
}

/** 将原始 query 参数统一编码后拼接到小程序路由路径。 */
export function parseObjToUrl(path: string, query: Record<string, string>) {
  const queryString = Object.keys(query)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`)
    .join('&')
  return queryString ? `${path}?${queryString}` : path
}

export function getAllPages(key = 'excludeLoginPath') {
  const mainPages = pages
    .filter(page => !key || page[key])
    .map(page => ({ ...page, path: `/${page.path}` }))

  const subPages: Array<Record<string, any>> = []
  subPackages.forEach((subPackage) => {
    subPackage.pages
      .filter(page => !key || page[key])
      .forEach(page => {
        subPages.push({ ...page, path: `/${subPackage.root}/${page.path}` })
      })
  })

  return [...mainPages, ...subPages]
}

export const HOME_PAGE = `/${pages.find(page => page.type === 'home')?.path || pages[0].path}`
