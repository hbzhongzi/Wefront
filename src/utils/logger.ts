/**
 * Logger 配置选项接口
 */
interface LoggerOptions {
  /** 是否启用控制台输出，默认为 true */
  useConsole?: boolean
  /** 是否启用日志上报，默认为 true */
  useReport?: boolean
}

/**
 * 微信小程序日志管理器接口
 */
interface WechatLogManager {
  log: (...args: any[]) => void
  info: (...args: any[]) => void
  warn: (...args: any[]) => void
}

/**
 * 微信小程序实时日志管理器接口
 */
interface WechatRealtimeLogManager {
  info: (...args: any[]) => void
  warn: (...args: any[]) => void
  error: (...args: any[]) => void
  setFilterMsg?: (msg: string) => void
  addFilterMsg?: (msg: string) => void
}

/**
 * 日志记录器类
 * 支持控制台输出和微信小程序日志上报
 */
class Logger {
  // #ifdef MP-WEIXIN
  /** 微信小程序日志管理器实例 */
  private logManager: WechatLogManager | null = uni.getLogManager
    ? uni.getLogManager({ level: 0 })
    : null

  /** 微信小程序实时日志管理器实例 */
  private realtimeLogManager: WechatRealtimeLogManager | null = uni.getRealtimeLogManager
    ? uni.getRealtimeLogManager()
    : null
  // #endif

  /** 是否启用日志上报 */
  private useReport: boolean = true
  /** 是否启用控制台输出 */
  private useConsole: boolean = true

  /**
   * 创建日志记录器实例
   * @param args 配置选项
   */
  constructor(args: LoggerOptions = {}) {
    this.useReport = args.useReport ?? true
    this.useConsole = args.useConsole ?? true
  }

  /**
   * 记录一般日志信息
   * @param args 要记录的参数
   */
  log(...args: any[]): void {
    this.useConsole && console.log(...args)
    // #ifdef MP-WEIXIN
    if (this.useReport) {
      this.realtimeLogManager && this.realtimeLogManager.info(...args)
      this.logManager && this.logManager.log(...args)
    }
    // #endif
  }

  /**
   * 记录信息日志
   * @param args 要记录的参数
   */
  info(...args: any[]): void {
    this.useConsole && console.info(...args)
    // #ifdef MP-WEIXIN
    if (this.useReport) {
      this.realtimeLogManager && this.realtimeLogManager.info(...args)
      this.logManager && this.logManager.info(...args)
    }
    // #endif
  }

  /**
   * 记录警告日志
   * @param args 要记录的参数
   */
  warn(...args: any[]): void {
    this.useConsole && console.warn(...args)
    // #ifdef MP-WEIXIN
    if (this.useReport) {
      this.realtimeLogManager && this.realtimeLogManager.warn(...args)
      this.logManager && this.logManager.warn(...args)
    }
    // #endif
  }

  /**
   * 记录错误日志
   * @param args 要记录的参数
   */
  error(...args: any[]): void {
    this.useConsole && console.error(...args)
    // #ifdef MP-WEIXIN
    if (this.useReport) {
      this.realtimeLogManager && this.realtimeLogManager.error(...args)
      this.logManager && this.logManager.warn(...args)
    }
    // #endif
  }

  /**
   * 设置过滤消息（微信小程序实时日志）
   * 从基础库2.7.3开始支持
   * @param msg 过滤消息内容
   */
  setFilterMsg(msg: string): void {
    // #ifdef MP-WEIXIN
    // 从基础库2.7.3开始支持
    if (!this.realtimeLogManager || !this.realtimeLogManager.setFilterMsg) {
      return
    }
    if (typeof msg !== 'string') {
      return
    }
    this.realtimeLogManager.setFilterMsg(msg)
    // #endif
  }

  /**
   * 添加过滤消息（微信小程序实时日志）
   * 从基础库2.8.1开始支持
   * @param msg 过滤消息内容
   */
  addFilterMsg(msg: string): void {
    // #ifdef MP-WEIXIN
    // 从基础库2.8.1开始支持
    if (!this.realtimeLogManager || !this.realtimeLogManager.addFilterMsg) {
      return
    }
    if (typeof msg !== 'string') {
      return
    }
    this.realtimeLogManager.addFilterMsg(msg)
    // #endif
  }
}

/**
 * 创建日志记录器实例的工厂函数
 * @param options 配置选项
 * @returns Logger 实例
 *
 * @example
 * ```typescript
 * // 基本使用
 * const logger = useLogger()
 * logger.info('这是一条信息日志')
 *
 * // 自定义配置
 * const customLogger = useLogger({
 *   useConsole: true,  // 启用控制台输出
 *   useReport: false   // 禁用日志上报
 * })
 *
 * // 开发环境使用（只输出到控制台）
 * const devLogger = useLogger({ useReport: false })
 * ```
 */
export function useLogger(options: LoggerOptions = {}): Logger {
  const { useConsole = import.meta.env.DEV, useReport = true } = options
  return new Logger({ useConsole, useReport })
}

/**
 * 开发环境专用的日志记录器实例
 * 只输出到控制台，不上报到微信小程序
 */
export const loggerDev = useLogger({ useReport: false })

// 导出类型定义
export type { LoggerOptions, WechatLogManager, WechatRealtimeLogManager }
