import type { UserTypes } from '@/api/user/types'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchLogin, fetchRefreshToken, fetchUserInfo } from '@/api/user'
import { loggerDev, useLogger } from '@/utils/logger'
import { getToken, setToken } from '@/utils/token'
import { useAppStore } from './app'

const logger = useLogger()
/** 虚拟登录token */
const SHARE_TEST_TOKEN = 'share_test_token'
export const useUserStore = defineStore(
  'user',
  () => {
    const initFinish = ref(false)
    const initUserFinish = ref(false)
    const userToken = ref(getToken())
    // 用户信息
    const userInfo = ref<UserTypes.UserInfo>()
    // 是否已经登录（也就是是否已经绑定手机号码）
    const isLogin = computed(() => !!userToken.value)

    const isVirtualScene = () => {
      const appStore = useAppStore()
      const { scene } = appStore.appOptions
      return [1154, 1129].includes(scene)
    }

    // 设置用户token
    const setUserToken = (token = '') => {
      userToken.value = token
      setToken(token)
    }

    // 设置用户信息
    const setUserInfo = (info: UserTypes.UserInfo) => {
      userInfo.value = { ...info }
      initUserFinish.value = true
    }

    /**
     * 获取用户信息
     */
    const getUserInfo = async () => {
      const res = await fetchUserInfo()
      setUserInfo(res)
      return res
    }

    /**
     * 退出
     */
    const logout = async () => {
      setUserToken()
      userInfo.value = undefined
      initFinish.value = false
      initUserFinish.value = false
    }

    /**
     * 登录
     */
    const login = async () => {
      // 没有token时，检查启动场景值
      // 场景值为 1154|1129，如朋友圈内打开“单页模式” 时，使用 虚拟登录
      if (isVirtualScene()) {
        return SHARE_TEST_TOKEN
      }

      return uni.login({
        provider: 'weixin',
      }).then(async ({ code }) => {
        console.log('code', code)
        return fetchLogin({ code }).then((res) => {
          const { token } = res
          setUserToken(token)
          return token
        })
      })
    }

    /**
     * 刷新 token
     * 逻辑同登录，分开处理便于差异化维护
     */
    const refreshToken = async () => {
      // 场景值为 1154|1129，如朋友圈内打开“单页模式” 时，使用 虚拟登录
      if (isVirtualScene()) {
        return SHARE_TEST_TOKEN
      }

      return uni.login({
        provider: 'weixin',
      }).then(async ({ code }) => {
        console.log('code', code)
        return fetchRefreshToken({ code }).then((res) => {
          const { token } = res
          setUserToken(token)
          return token
        })
      })
    }

    /**
     * 检查小程序session是否有效
     */
    const checkSession = () => {
      return new Promise<void>((resolve) => {
        // #ifndef H5
        uni.checkSession({
          success: resolve,
          fail: () => {
            loggerDev.log('session 失效，清除本地数据，重新授权登录')
            logout()
            resolve()
          },
        })
        // #endif
        // #ifdef H5
        resolve()
        // #endif
      })
    }

    /**
     * 获取token
     * 存在时，直接返回
     * 不存在则根据情况去获取
     * @returns Promise<string>
     */
    const getUserToken = async (): Promise<string> => {
      // 有token时，直接返回
      if (userToken.value) {
        return userToken.value
      }

      // 没有 token 执行登录逻辑获取 token 并返回
      return login()
    }

    /**
     * 初始化信息
     */
    const initUser = async () => {
      try {
        await checkSession()
        if (isVirtualScene()) {
          initFinish.value = true
          return
        }
        await getUserInfo()
        initFinish.value = true
      }
      catch (err) {
        logger.error('初始化失败', err)
      }
    }

    return {
      userToken,
      userInfo,
      isLogin,
      getUserInfo,
      setUserInfo,
      logout,
      login,
      refreshToken,
      getUserToken,
      initUser,
    }
  },
  {
    // persist: true,
  },
)
