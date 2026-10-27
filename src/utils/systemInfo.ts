/* eslint-disable import/no-mutable-exports */
/** 安全区域到屏幕边界的距离，部分平台无法获取时统一为 null */
type SafeAreaInsets = UniNamespace.SafeAreaInsets | null

/** 微信端新 API 与其他平台旧 API 的统一系统信息 */
type BaseSystemInfo = Partial<
  Omit<UniNamespace.GetSystemInfoResult, 'safeAreaInsets'>
  & Omit<UniNamespace.GetWindowInfoResult, 'safeAreaInsets'>
  & UniNamespace.GetDeviceInfoResult
  & UniNamespace.GetAppBaseInfoResult
>

/** 应用内统一使用的系统信息 */
type AppSystemInfo = BaseSystemInfo & {
  /** 客户端平台，例如 ios/android/devtools */
  platform: string
  /** 安全区域到屏幕边界的距离 */
  safeAreaInsets: SafeAreaInsets
  /** 微信小程序右上角胶囊按钮信息，用于计算自定义导航栏高度 */
  menuButtonInfo?: UniNamespace.GetMenuButtonBoundingClientRectRes
}

/** 应用启动时读取的系统信息 */
let systemInfo: AppSystemInfo

/** 安全区域到屏幕边界的距离 */
let safeAreaInsets: SafeAreaInsets

/** 非微信端及胶囊信息异常时的导航栏内容区高度 */
const DEFAULT_NAVBAR_CONTENT_HEIGHT = 44

// #ifdef MP-WEIXIN
/** 微信小程序窗口信息 */
const windowInfo = uni.getWindowInfo()

/** 微信小程序设备信息 */
const deviceInfo = uni.getDeviceInfo()

/** 微信小程序基础信息 */
const appBaseInfo = uni.getAppBaseInfo()

/** 微信小程序右上角胶囊按钮信息 */
const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
systemInfo = {
  ...windowInfo,
  ...deviceInfo,
  ...appBaseInfo,
  menuButtonInfo,
}
safeAreaInsets = windowInfo.safeArea
  ? {
      top: windowInfo.safeArea.top,
      right: windowInfo.windowWidth - windowInfo.safeArea.right,
      bottom: windowInfo.windowHeight - windowInfo.safeArea.bottom,
      left: windowInfo.safeArea.left,
    }
  : null
systemInfo.safeAreaInsets = safeAreaInsets
// #endif

// #ifndef MP-WEIXIN
// 其他平台继续使用uni API
systemInfo = uni.getSystemInfoSync() as AppSystemInfo
safeAreaInsets = systemInfo.safeAreaInsets ?? null
// #endif

/** 获取不含状态栏的自定义导航栏内容区高度 */
export function getNavbarContentHeight(): number {
  /** 导航栏内容区高度 */
  let height = DEFAULT_NAVBAR_CONTENT_HEIGHT

  // #ifdef MP-WEIXIN
  /** 微信小程序右上角胶囊按钮信息 */
  const menuButton = systemInfo.menuButtonInfo

  /** 系统状态栏高度 */
  const statusBarHeight = systemInfo.statusBarHeight ?? 0
  if (menuButton?.height && menuButton.top >= statusBarHeight) {
    height = menuButton.height + (menuButton.top - statusBarHeight) * 2
  }
  // #endif

  return height
}

/** 获取包含状态栏的自定义导航栏总高度 */
export function getNavbarHeight(): number {
  return (systemInfo.statusBarHeight ?? 0) + getNavbarContentHeight()
}

console.log('systemInfo', systemInfo)
// 微信里面打印
// pixelRatio: 3
// safeArea: {top: 47, left: 0, right: 390, bottom: 810, width: 390, …}
// safeAreaInsets: {top: 47, left: 0, right: 0, bottom: 34}
// screenHeight: 844
// screenTop: 91
// screenWidth: 390
// statusBarHeight: 47
// windowBottom: 0
// windowHeight: 753
// windowTop: 0
// windowWidth: 390
export { safeAreaInsets, systemInfo }
