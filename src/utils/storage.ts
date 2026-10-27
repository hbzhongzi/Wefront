/**
 * Storage 配置选项接口
 */
interface StorageOptions {
  /** 存储键名前缀，默认为空字符串 */
  prefix?: string
}

/**
 * 存储数据结构接口
 */
interface StorageData<T = any> {
  /** 存储的数据 */
  data: T
  /** 过期时间戳，-1 表示永不过期 */
  expire: number
}

/**
 * 本地存储管理类
 * 提供统一的本地存储接口，支持数据过期和前缀管理
 *
 * @example
 * ```typescript
 * // 创建存储实例
 * const storage = new Storage({ prefix: 'app' })
 *
 * // 存储数据
 * storage.set('user', { id: 1, name: 'John' })
 * storage.set('token', 'abc123', 3600) // 1小时后过期
 *
 * // 获取数据
 * const user = storage.get('user')
 * const token = storage.get('token')
 *
 * // 删除数据
 * storage.remove('token')
 * storage.removeAll() // 删除所有带前缀的数据
 * ```
 */
class Storage {
  /** 存储键名前缀 */
  private prefix: string = ''

  /**
   * 创建存储实例
   * @param options 配置选项
   */
  constructor(options: StorageOptions = {}) {
    this.prefix = options.prefix ?? ''
  }

  /**
   * 检查 key 是否合法
   * @param key 本地缓存中的指定的 key
   * @throws {Error} 当 key 为空或不是字符串时抛出错误
   */
  private verifyKey(key: string): void {
    const type = Object.prototype.toString.call(key).match(/\[object (.+)\]/)?.[1]

    if (key === '') {
      throw new Error('key is empty')
    }
    else if (type !== 'String') {
      throw new Error(`the first parameter should be a string instead of ${type}`)
    }
  }

  /**
   * 获取完整前缀
   * @returns 格式化的前缀字符串
   */
  private getPrefix(): string {
    return `${this.prefix.toUpperCase()}_`
  }

  /**
   * 获取本地缓存的完整 key
   * @param key 本地缓存中的指定的 key
   * @returns 带前缀的完整键名
   */
  private getKey(key: string): string {
    return this.getPrefix() + key
  }

  /**
   * 从本地缓存中异步获取指定 key 对应的内容
   * @param key 本地缓存中的指定的 key
   * @returns 存储的数据，如果不存在或已过期则返回空字符串
   *
   * @example
   * ```typescript
   * const storage = new Storage({ prefix: 'app' })
   *
   * // 获取数据
   * const user = storage.get('user')
   * console.log(user) // { id: 1, name: 'John' }
   *
   * // 获取不存在的键
   * const notFound = storage.get('not-exist')
   * console.log(notFound) // ''
   * ```
   */
  get<T = any>(key: string): T | '' {
    try {
      this.verifyKey(key)

      const timer = new Date().getTime()
      const rawData = uni.getStorageSync(this.getKey(key))
      const localData = (typeof rawData === 'string'
        ? JSON.parse(rawData)
        : rawData) as StorageData<T> | null

      if (localData) {
        const { data, expire } = localData
        if (timer <= expire || expire === -1) {
          return data
        }
        else {
          // 过期删除
          this.remove(key)
          return ''
        }
      }
      else {
        return ''
      }
    }
    catch (err) {
      console.error('get: fail', err)
      return ''
    }
  }

  /**
   * 将数据存储在本地缓存中指定的 key 中
   * @param key 本地缓存中的指定的 key
   * @param data 需要存储的内容
   * @param expire 过期时间(秒), -1 为永久, 默认 -1
   *
   * @example
   * ```typescript
   * const storage = new Storage({ prefix: 'app' })
   *
   * // 永久存储
   * storage.set('user', { id: 1, name: 'John' })
   *
   * // 设置过期时间（1小时）
   * storage.set('token', 'abc123', 3600)
   *
   * // 存储空值会删除该键
   * storage.set('temp', null) // 等同于 remove('temp')
   * ```
   */
  set<T = any>(key: string, data: T, expire: number = -1): void {
    try {
      this.verifyKey(key)

      const _key = this.getKey(key)

      if (['', undefined, null].includes(data as any)) {
        uni.removeStorageSync(_key)
        return
      }

      const timeout = [null, undefined, -1].includes(expire)
        ? -1
        : new Date().getTime() + expire * 1000

      const newData: StorageData<T> = {
        data,
        expire: timeout,
      }
      uni.setStorageSync(_key, newData)
    }
    catch (err) {
      console.error('set: fail ', err)
    }
  }

  /**
   * 从本地缓存中移除指定 key
   * @param key 本地缓存中的指定的 key
   *
   * @example
   * ```typescript
   * const storage = new Storage({ prefix: 'app' })
   *
   * // 删除指定键
   * storage.remove('user')
   *
   * // 删除后获取会返回空字符串
   * console.log(storage.get('user')) // ''
   * ```
   */
  remove(key: string): void {
    try {
      this.verifyKey(key)

      uni.removeStorageSync(this.getKey(key))
    }
    catch (err) {
      console.error('remove: fail', err)
    }
  }

  /**
   * 清理本地数据缓存
   * 删除所有带有指定前缀的存储项
   *
   * @example
   * ```typescript
   * const storage = new Storage({ prefix: 'app' })
   *
   * // 存储多个数据
   * storage.set('user', { id: 1 })
   * storage.set('token', 'abc123')
   * storage.set('settings', { theme: 'dark' })
   *
   * // 删除所有带 'app_' 前缀的数据
   * storage.removeAll()
   *
   * // 所有数据都被删除
   * console.log(storage.get('user')) // ''
   * console.log(storage.get('token')) // ''
   * console.log(storage.get('settings')) // ''
   * ```
   */
  removeAll(): void {
    try {
      const prefix = this.getPrefix()
      let { keys } = uni.getStorageInfoSync()
      keys = keys
        .filter(key => ~key.indexOf(prefix))
        .map((key) => {
          const reg = new RegExp(prefix, 'gi')
          return key.replace(reg, '')
        })
      keys.forEach((key) => {
        this.remove(key)
      })
    }
    catch (err) {
      console.error('removeAll: fail', err)
    }
  }

  /**
   * 检查指定 key 是否存在且未过期
   * @param key 要检查的键名
   * @returns 是否存在且未过期
   */
  has(key: string): boolean {
    try {
      this.verifyKey(key)
      const data = this.get(key)
      return data !== ''
    }
    catch (err) {
      return false
    }
  }

  /**
   * 获取存储信息统计
   * @returns 存储统计信息
   */
  getInfo(): { total: number, withPrefix: number, prefix: string } {
    try {
      const { keys } = uni.getStorageInfoSync()
      const prefix = this.getPrefix()
      const withPrefix = keys.filter(key => key.indexOf(prefix) === 0).length

      return {
        total: keys.length,
        withPrefix,
        prefix,
      }
    }
    catch (err) {
      console.error('getInfo: fail', err)
      return { total: 0, withPrefix: 0, prefix: this.getPrefix() }
    }
  }
}

/**
 * 创建存储实例的工厂函数
 * @param prefix 存储键名前缀，默认为 '__local_storage'
 * @returns Storage 实例
 *
 * @example
 * ```typescript
 * // 使用默认前缀
 * const storage = useStorage()
 *
 * // 使用自定义前缀
 * const userStorage = useStorage('user')
 * const appStorage = useStorage('app')
 *
 * // 不同前缀的数据互不影响
 * userStorage.set('profile', { name: 'John' })
 * appStorage.set('settings', { theme: 'dark' })
 * ```
 */
export function useStorage(prefix: string = '__local_storage__'): Storage {
  return new Storage({ prefix })
}

// 导出类型定义
export type { StorageData, StorageOptions }
