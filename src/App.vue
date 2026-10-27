<script setup lang="ts">
import { onHide, onLaunch, onShow } from '@dcloudio/uni-app'
import { navigateToInterceptor } from '@/router/interceptor'
import { useAppStore } from '@/store/app'
import { useUserStore } from '@/store/user'
import { useLogger } from '@/utils/logger'
import { useUpdateManager } from '@/utils/updateManager'

const logger = useLogger({ useConsole: true })

const appStore = useAppStore()
const userStore = useUserStore()

onLaunch((options) => {
  logger.addFilterMsg('AppOnLaunch')
  logger.info('App onLaunch', options)
  logger.info('App systemInfo', { ...appStore.systemInfo })
  logger.info('App accountInfo', { ...appStore.accountInfo })
  appStore.setLaunchOptions(options)

  Promise.allSettled([
    userStore.initUser(),
  ])
    .then(() => {
      logger.info('shareConfig', { ...appStore.shareConfig })
      logger.info(
        'userInfo',
        userStore.userInfo ? { ...userStore.userInfo } : undefined,
      )
    })
    .finally(() => {
      useUpdateManager()
    })
})

onShow((options) => {
  logger.addFilterMsg('AppOnShow')
  logger.info('App onShow', options)
  appStore.setAppOptions(options)
  // 处理直接进入页面路由的情况：如h5直接输入路由、微信小程序分享后进入等
  // https://github.com/unibest-tech/unibest/issues/192
  if (options?.path) {
    navigateToInterceptor.invoke({
      url: `/${options.path}`,
      query: options.query,
    })
  } else {
    navigateToInterceptor.invoke({ url: '/' })
  }
})

onHide(() => {
  logger.addFilterMsg('AppOnHide')
  logger.info('App onHide')
})

onPageNotFound((event) => {
  logger.addFilterMsg('AppOnPageNotFound')
  logger.error('App onPageNotFound', event)
})

onError((event) => {
  logger.addFilterMsg('AppOnError')
  logger.error('App onError', event)
})

onUnhandledRejection((event) => {
  logger.addFilterMsg('AppOnUnhandledRejection')
  logger.error('App onUnhandledRejection', event)
})

// 配置globalData，必须在nextTick中，否则会报错
nextTick(() => {
  getApp().globalData = {}
})
</script>

<style lang="scss"></style>
