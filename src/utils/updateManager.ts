/**
 * 检查程序更新
 */
import { useAppStore } from '@/store/app'

export function useUpdateManager() {
  const appStore = useAppStore()
  const { os } = appStore
  if (os === 'devtools') {
    // 开发环境不处理
    return
  }
  // #ifdef MP
  console.log('小程序检查更新')
  if (!uni.canIUse('getUpdateManager')) {
    return
  }

  const updateManager = uni.getUpdateManager()

  updateManager.onCheckForUpdate((res) => {
    // 请求完新版本信息的回调
    console.log('版本信息', res)
  })

  updateManager.onUpdateReady(() => {
    uni.showModal({
      title: '更新提示',
      content: '新版本已经准备好，是否重启应用？',
      success(res) {
        if (res.confirm) {
          // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
          updateManager.applyUpdate()
        }
      },
    })
  })

  updateManager.onUpdateFailed((error) => {
    // 新版本下载失败
    console.error('更新失败：', error)
  })
  // #endif
}
