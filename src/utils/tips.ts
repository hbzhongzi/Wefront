/**
 * 确认弹窗参数接口
 */
interface ConfirmOptions {
  /** 弹窗标题 */
  title?: string
  /** 弹窗内容 */
  content?: string
  /** 是否显示取消按钮 */
  showCancel?: boolean
  /** 取消按钮文字 */
  cancelText?: string
  /** 取消按钮颜色 */
  cancelColor?: string
  /** 确认按钮文字 */
  confirmText?: string
  /** 确认按钮颜色 */
  confirmColor?: string
  /** 成功回调 */
  success?: (res: UniApp.ShowModalRes) => void
  /** 失败回调 */
  fail?: (err: any) => void
  /** 完成回调 */
  complete?: (res: any) => void
}

/**
 * Toast 参数接口
 */
interface ToastOptions {
  /** 提示内容 */
  title?: string
  /** 提示持续时间 */
  duration?: number
  /** 是否显示透明蒙层 */
  mask?: boolean
  /** 图标类型 */
  icon?: 'none' | 'success' | 'loading' | 'error'
}

/**
 * 提示与加载工具类
 * 提供统一的提示、确认、加载等功能
 *
 * @example
 * ```typescript
 * import tips from '@/utils/tips'
 *
 * // 显示确认弹窗
 * tips.confirm('确定要删除吗？').then((confirmed) => {
 *   if (confirmed) {
 *     console.log('用户确认')
 *     deleteItem()
 *   } else {
 *     console.log('用户取消')
 *   }
 * })
 *
 * // 显示提示
 * tips.toast('操作成功')
 * tips.success('保存成功')
 *
 * // 显示加载
 * tips.loading('加载中...')
 * // 隐藏加载
 * tips.hideLoading()
 * ```
 */
class Tips {
  /** 是否正在显示确认弹窗 */
  private isUsedConfirm: boolean = false
  /** 是否正在显示加载 */
  private isLoading: boolean = false

  constructor() {}

  /**
   * 确认窗口
   * @param params 参数，可以是字符串或配置对象
   * @returns Promise<boolean> 用户确认时返回 true，取消时返回 false
   *
   * @example
   * ```typescript
   * // 简单使用
   * tips.confirm('确定要删除吗？').then((confirmed) => {
   *   if (confirmed) {
   *     // 用户点击确定
   *     deleteItem()
   *   } else {
   *     // 用户点击取消
   *     console.log('取消删除')
   *   }
   * })
   *
   * // 自定义配置
   * tips.confirm({
   *   title: '确认操作',
   *   content: '此操作不可撤销，确定继续吗？',
   *   showCancel: true,
   *   confirmText: '确定',
   *   cancelText: '取消'
   * }).then((confirmed) => {
   *   if (confirmed) {
   *     console.log('用户确认')
   *   } else {
   *     console.log('用户取消')
   *   }
   * })
   * ```
   */
  confirm(params: string | ConfirmOptions = {}): Promise<boolean> {
    if (this.isUsedConfirm) {
      return Promise.reject(new Error('确认弹窗已存在'))
    }
    this.isUsedConfirm = true

    let args: ConfirmOptions = {}
    if (typeof params === 'string') {
      args.content = params
    }
    else {
      args = { ...params }
    }

    return new Promise<boolean>((resolve, reject) => {
      uni.showModal({
        title: args.title || '',
        content: args.content || '',
        showCancel: args.showCancel || false,
        cancelText: args.cancelText || '取消',
        cancelColor: args.cancelColor || '#000000',
        confirmText: args.confirmText || '确定',
        confirmColor: args.confirmColor || '#1688f8',
        success: (res: UniApp.ShowModalRes) => {
          args.success?.(res)
          if (!args.success) {
            if (res.confirm) {
              resolve(true)
            }
            else if (res.cancel) {
              resolve(false)
            }
          }
        },
        fail: (err: any) => {
          args.fail?.(err)
          if (!args.fail) {
            reject(err)
          }
        },
        complete: (res: any) => {
          this.isUsedConfirm = false
          args.complete?.(res)
        },
      })
    })
  }

  /**
   * 普通提示（无图标）
   * @param params 参数，可以是字符串或配置对象
   * @returns Promise<void> 提示显示完成后的 Promise
   *
   * @example
   * ```typescript
   * // 简单使用
   * tips.toast('操作完成')
   *
   * // 自定义配置
   * tips.toast({
   *   title: '网络连接失败',
   *   duration: 3000,
   *   mask: true
   * })
   * ```
   */
  toast(params: string | ToastOptions = {}): Promise<void> {
    let args: ToastOptions = {
      title: '',
      duration: 1500,
      mask: true,
      icon: 'none',
    }
    if (typeof params === 'string') {
      args.title = params
    }
    else {
      args = { ...args, ...params }
    }

    this.hideLoading()
    uni.showToast(args)

    if ((args.duration ?? 0) > 0) {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve()
        }, args.duration)
      })
    }
    else {
      return Promise.resolve()
    }
  }

  /**
   * 成功提示
   * @param params 参数，可以是字符串或配置对象
   * @returns Promise<void> 提示显示完成后的 Promise
   *
   * @example
   * ```typescript
   * // 简单使用
   * tips.success('保存成功')
   *
   * // 自定义配置
   * tips.success({
   *   title: '操作成功',
   *   duration: 2000
   * })
   * ```
   */
  success(params: string | ToastOptions = {}): Promise<void> {
    let args: ToastOptions = {
      title: '',
      duration: 1500,
      mask: true,
      icon: 'success',
    }
    if (typeof params === 'string') {
      args.title = params
    }
    else {
      args = { ...args, ...params }
    }

    this.hideLoading()
    uni.showToast(args)

    if ((args.duration ?? 0) > 0) {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve()
        }, args.duration)
      })
    }
    else {
      return Promise.resolve()
    }
  }

  /**
   * 弹出加载提示
   * @param title 加载提示文案，默认为 '加载中...'
   *
   * @example
   * ```typescript
   * // 显示加载
   * tips.loading('正在上传...')
   *
   * // 使用默认文案
   * tips.loading()
   *
   * // 隐藏加载
   * tips.hideLoading()
   * ```
   */
  loading(title: string = '加载中...'): void {
    if (this.isLoading) {
      return
    }
    this.isLoading = true
    uni.showLoading({
      title,
      mask: true,
      fail: () => {},
    })
  }

  /**
   * 隐藏加载提示
   *
   * @example
   * ```typescript
   * // 显示加载
   * tips.loading('加载中...')
   *
   * // 异步操作完成后隐藏
   * try {
   *   await someAsyncOperation()
   * } finally {
   *   tips.hideLoading()
   * }
   * ```
   */
  hideLoading(): void {
    if (this.isLoading) {
      this.isLoading = false
      uni.hideLoading()
    }
  }

  /**
   * 错误提示
   * @param params 参数，可以是字符串或配置对象
   * @returns Promise<void> 提示显示完成后的 Promise
   *
   * @example
   * ```typescript
   * // 简单使用
   * tips.error('操作失败')
   *
   * // 自定义配置
   * tips.error({
   *   title: '网络错误',
   *   duration: 3000
   * })
   * ```
   */
  error(params: string | ToastOptions = {}): Promise<void> {
    let args: ToastOptions = {
      title: '',
      duration: 1500,
      mask: true,
      icon: 'error',
    }
    if (typeof params === 'string') {
      args.title = params
    }
    else {
      args = { ...args, ...params }
    }

    this.hideLoading()
    uni.showToast(args)

    if ((args.duration ?? 0) > 0) {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve()
        }, args.duration)
      })
    }
    else {
      return Promise.resolve()
    }
  }

  /**
   * 检查是否正在显示加载
   * @returns boolean 是否正在显示加载
   */
  isShowingLoading(): boolean {
    return this.isLoading
  }

  /**
   * 检查是否正在显示确认弹窗
   * @returns boolean 是否正在显示确认弹窗
   */
  isShowingConfirm(): boolean {
    return this.isUsedConfirm
  }
}

export default new Tips()

// 导出类型定义
export type { ConfirmOptions, ToastOptions }
