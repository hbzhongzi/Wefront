/**
 * 队列任务项接口
 */
interface QueueTaskItem {
  /** 要执行的任务函数 */
  task: () => Promise<any>
  /** 任务成功时的回调 */
  resolve: (value: any) => void
  /** 任务失败时的回调 */
  reject: (reason: any) => void
}

/**
 * 队列状态接口
 */
interface QueueStatus {
  /** 是否有任务正在执行 */
  isRunning: boolean
  /** 等待中的任务数量 */
  waitingCount: number
  /** 当前正在执行的任务数量 */
  runningCount: number
  /** 最大并发数 */
  maxConcurrency: number
}

/**
 * 队列配置选项
 */
interface QueueOptions {
  /** 最大并发数，默认为1（单线程） */
  maxConcurrency?: number
  /** 是否自动开始执行，默认为true */
  autoStart?: boolean
}

/**
 * 任务队列类
 * 支持并发执行的任务队列，确保任务按顺序添加到队列并按并发数执行
 *
 * @example
 * ```typescript
 * import { Queue } from '@/utils/queue'
 *
 * // 单线程队列（默认）
 * const queue = new Queue()
 *
 * // 并发队列
 * const concurrentQueue = new Queue({ maxConcurrency: 3 })
 *
 * // 添加任务
 * queue.push(async () => {
 *   await someAsyncOperation()
 *   return 'task completed'
 * }).then(result => {
 *   console.log(result) // 'task completed'
 * })
 * ```
 */
class Queue {
  /** 等待中的任务队列 */
  private waitingQueue: QueueTaskItem[] = []

  /** 当前正在执行的任务数量 */
  private runningCount: number = 0

  /** 最大并发数 */
  private maxConcurrency: number

  /** 是否自动开始执行 */
  private autoStart: boolean

  /** 队列是否已停止 */
  private isStopped: boolean = false

  constructor(options: QueueOptions = {}) {
    this.maxConcurrency = options.maxConcurrency || 1
    this.autoStart = options.autoStart !== false
    this.waitingQueue = []
    this.runningCount = 0
    this.isStopped = false
  }

  /**
   * 执行队列中的任务
   * @param task 要执行的任务函数
   * @param resolve 任务成功时的回调
   * @param reject 任务失败时的回调
   */
  private execute(
    task: () => Promise<any>,
    resolve: (value: any) => void,
    reject: (reason: any) => void,
  ): void {
    this.runningCount++

    task()
      .then(resolve)
      .catch(reject)
      .finally(() => {
        this.runningCount--
        this.processNext()
      })
  }

  /**
   * 处理下一个任务
   */
  private processNext(): void {
    if (this.isStopped || this.waitingQueue.length === 0) {
      return
    }

    // 检查是否可以启动新的任务
    while (this.runningCount < this.maxConcurrency && this.waitingQueue.length > 0) {
      const next = this.waitingQueue.shift()
      if (next) {
        this.execute(next.task, next.resolve, next.reject)
      }
    }
  }

  /**
   * 添加任务到队列
   * @param task 要执行的异步任务函数
   * @returns Promise<any> 返回任务的执行结果
   *
   * @example
   * ```typescript
   * const queue = new Queue({ maxConcurrency: 2 })
   *
   * // 基本使用
   * const result = await queue.push(async () => {
   *   const response = await fetch('/api/data')
   *   return response.json()
   * })
   * console.log('获取数据成功:', result)
   *
   * // 多个任务会按并发数执行
   * queue.push(async () => await task1())
   * queue.push(async () => await task2())
   * queue.push(async () => await task3())
   * // 如果 maxConcurrency = 2，则 task1 和 task2 同时执行，task3 等待
   * ```
   */
  push<T = any>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      if (this.isStopped) {
        reject(new Error('Queue is stopped'))
        return
      }

      this.waitingQueue.push({ task, resolve, reject })

      if (this.autoStart) {
        this.processNext()
      }
    })
  }

  /**
   * 开始执行队列中的任务
   */
  start(): void {
    this.isStopped = false
    this.processNext()
  }

  /**
   * 停止队列（不再接受新任务，但正在执行的任务会继续完成）
   */
  stop(): void {
    this.isStopped = true
  }

  /**
   * 暂停队列（暂停处理新任务，但保留等待队列）
   */
  pause(): void {
    this.isStopped = true
  }

  /**
   * 恢复队列执行
   */
  resume(): void {
    this.isStopped = false
    this.processNext()
  }

  /**
   * 获取当前等待队列的长度
   * @returns number 等待中的任务数量
   */
  getWaitingCount(): number {
    return this.waitingQueue.length
  }

  /**
   * 获取当前正在执行的任务数量
   * @returns number 正在执行的任务数量
   */
  getRunningCount(): number {
    return this.runningCount
  }

  /**
   * 检查队列是否正在运行
   * @returns boolean 是否有任务正在执行
   */
  isExecuting(): boolean {
    return this.runningCount > 0
  }

  /**
   * 检查队列是否为空（无等待任务且无运行任务）
   * @returns boolean 队列是否为空
   */
  isEmpty(): boolean {
    return this.waitingQueue.length === 0 && this.runningCount === 0
  }

  /**
   * 检查队列是否已停止
   * @returns boolean 队列是否已停止
   */
  isQueueStopped(): boolean {
    return this.isStopped
  }

  /**
   * 清空等待队列
   * 注意：正在执行的任务不会被中断
   */
  clear(): void {
    this.waitingQueue = []
  }

  /**
   * 获取队列状态信息
   * @returns 队列状态对象
   */
  getStatus(): QueueStatus {
    return {
      isRunning: this.runningCount > 0,
      waitingCount: this.waitingQueue.length,
      runningCount: this.runningCount,
      maxConcurrency: this.maxConcurrency,
    }
  }

  /**
   * 等待所有任务完成
   * @returns Promise<void>
   */
  async waitForAll(): Promise<void> {
    return new Promise<void>((resolve) => {
      const checkComplete = () => {
        if (this.isEmpty()) {
          resolve()
        }
        else {
          setTimeout(checkComplete, 10)
        }
      }
      checkComplete()
    })
  }

  /**
   * 设置最大并发数
   * @param maxConcurrency 最大并发数
   */
  setMaxConcurrency(maxConcurrency: number): void {
    this.maxConcurrency = Math.max(1, maxConcurrency)
    this.processNext()
  }

  /**
   * 获取最大并发数
   * @returns number 最大并发数
   */
  getMaxConcurrency(): number {
    return this.maxConcurrency
  }
}

/**
 * 全局单例队列实例
 * 可以在整个应用中使用同一个队列实例
 */
class GlobalQueue {
  private static instance: Queue | null = null
  private static options: QueueOptions = {}

  /**
   * 初始化全局队列
   * @param options 队列配置选项
   */
  static init(options: QueueOptions = {}): Queue {
    if (!GlobalQueue.instance) {
      GlobalQueue.options = options
      GlobalQueue.instance = new Queue(options)
    }
    return GlobalQueue.instance
  }

  /**
   * 获取全局队列实例
   * @returns Queue 全局队列实例
   */
  static getInstance(): Queue {
    if (!GlobalQueue.instance) {
      GlobalQueue.instance = new Queue(GlobalQueue.options)
    }
    return GlobalQueue.instance
  }

  /**
   * 重置全局队列实例
   */
  static reset(): void {
    GlobalQueue.instance = null
  }
}

// 导出类
export default Queue

// 导出全局队列相关
export { GlobalQueue }

// 导出类型定义
export type { QueueOptions, QueueStatus, QueueTaskItem }
