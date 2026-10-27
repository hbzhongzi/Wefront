import { pages, subPackages } from '@/pages.json'

export function getLastPage() {
  const pageList = getCurrentPages()
  return pageList[pageList.length - 1]
}

export function ensureDecodeURIComponent(url: string) {
  if (url.startsWith('%')) {
    return ensureDecodeURIComponent(decodeURIComponent(url))
  }
  return url
}

export function parseUrlToObj(url: string) {
  const [path, queryStr] = url.split('?')

  if (!queryStr) {
    return { path, query: {} }
  }

  const query: Record<string, string> = {}
  queryStr.split('&').forEach((item) => {
    const [key, value] = item.split('=')
    query[key] = ensureDecodeURIComponent(value)
  })
  return { path, query }
}

export function parseObjToUrl(path: string, query: Record<string, string>) {
  const queryString = Object.keys(query)
    .map(key => `${key}=${query[key]}`)
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
