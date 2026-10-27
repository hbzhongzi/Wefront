import { defineStore } from 'pinia'
import { ref } from 'vue'
import { tabbarList } from '@/tabbar/store'

export const useRefreshStore = defineStore('refresh', () => {
  const marks = ref<Record<string, number>>({})
  const visitedTabbarPathMap = ref<Record<string, boolean>>({})

  /**
   * 规范化页面路径：补全前导 `/` 并去掉 query 部分
   */
  function normalizePagePath(path: string) {
    return (path.startsWith('/') ? path : `/${path}`).split('?')[0]
  }

  /**
   * 将 refresh key 转为页面路径，如 `pages:order:list` → `pages/order/list`
   */
  function refreshKeyToPath(key: string) {
    return key.replace(/:/g, '/')
  }

  /**
   * 将页面路径转为 refresh key，如 `pages/order/list` → `pages:order:list`
   */
  function pathToRefreshKey(path: string) {
    return path.replace(/^\//, '').replace(/\//g, ':')
  }

  /**
   * 判断路径是否为 tabBar 页面
   */
  function isPageTabbar(path: string) {
    const normalizedPath = normalizePagePath(path)
    return tabbarList.some(item => item.pagePath === normalizedPath)
  }

  /**
   * 记录用户已访问过的 tabBar 页，供 mark 判断 tabBar 目标是否可打标
   */
  function recordVisitedTabbar(path: string) {
    const normalizedPath = normalizePagePath(path)
    if (isPageTabbar(normalizedPath)) {
      visitedTabbarPathMap.value[normalizedPath] = true
    }
  }

  /**
   * 判断 tabBar 页是否已被用户访问过
   */
  function isVisitedTabbarPath(path: string) {
    return Boolean(visitedTabbarPathMap.value[normalizePagePath(path)])
  }

  /**
   * 获取当前页面对应的 refresh key
   */
  function getCurrentRouteKey() {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    return currentPage?.route ? pathToRefreshKey(currentPage.route) : ''
  }

  /**
   * 打标记
   * 逻辑：将 key 中的 ':' 替换为 '/' 得到目标路径，并与当前页面栈中的 route 进行全量匹配。
   * tabBar 页可能已打开但不在当前页面栈中，因此由 tabbar 配置统一识别并允许打标。
   * 非 tabBar 页面不在当前页面栈中时忽略标记（因为新开页面会触发 onLoad 自动获取最新数据）。
   * @param key refresh key，格式为页面路径将 `/` 替换为 `:`，如 `pages:order:list`
   */
  function mark(key: string) {
    const targetPath = refreshKeyToPath(key)
    const isTabbarTarget = isPageTabbar(targetPath)

    const pages = getCurrentPages()
    const isInStack = pages.some(page => page.route === targetPath)

    if (isTabbarTarget && !isVisitedTabbarPath(targetPath) && !isInStack) {
      return
    }

    if (!isTabbarTarget && pages.length > 0 && !isInStack) {
      return
    }

    marks.value[key] = Date.now()
  }

  /**
   * 消费标记
   * @param key refresh key，不传时自动取当前页面对应的 key
   * @returns 存在未消费标记时返回 true 并清除标记，否则返回 false
   */
  function consume(key?: string) {
    const refreshKey = key || getCurrentRouteKey()
    if (!refreshKey || !marks.value[refreshKey])
      return false

    delete marks.value[refreshKey]
    return true
  }

  return {
    mark,
    consume,
    recordVisitedTabbar,
  }
})
