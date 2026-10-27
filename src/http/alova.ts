import type { uniappRequestAdapter } from '@alova/adapter-uniapp'
import type { Response } from './types'
import AdapterUniapp from '@alova/adapter-uniapp'
import { createAlova } from 'alova'
import { createServerTokenAuthentication } from 'alova/client'
import VueHook from 'alova/vue'
import { LOGIN_PAGE } from '@/router/config'
import { useAppStore, useUserStore } from '@/store'
import { useLogger } from '@/utils/logger'
import Queue from '@/utils/queue'
import tips from '@/utils/tips'
import { ContentTypeEnum, ResultEnum, ShowMessage } from './tools/enum'

const queue = new Queue()
const logger = useLogger()

// 配置动态Tag
export const API_DOMAINS = {
  DEFAULT: import.meta.env.VITE_SERVER_BASEURL || '',
  SECONDARY: import.meta.env.VITE_API_SECONDARY_URL,
}

// meta 可用字段信息
// const meta = {
//   ignoreAuth: false, // 忽略登录拦截器
//   alert: true, // 提示错误信息
//   report: true, // 上报错误日志
//   domain: '', // 动态域名
//   authRole: 'refreshToken' // 刷新token标识
// }

/**
 * 创建请求实例
 */
const { onAuthRequired, onResponseRefreshToken } = createServerTokenAuthentication<
  typeof VueHook,
  typeof uniappRequestAdapter
>({
  refreshTokenOnSuccess: {
    isExpired: (response: UniApp.RequestSuccessCallbackResult) => {
      const { code } = response.data as Response
      return code === ResultEnum.Unauthorized
    },
    handler: async () => {
      try {
        const userStore = useUserStore()
        await userStore.logout()
        await userStore.refreshToken()
      }
      catch (error) {
        logger.log('登录失败', error)
        // 切换到登录页
        await uni.reLaunch({ url: LOGIN_PAGE })
        throw error
      }
    },
  },
})

/**
 * alova 请求实例
 */
const alovaInstance = createAlova({
  baseURL: API_DOMAINS.DEFAULT,
  // baseURL: import.meta.env.VITE_APP_BASE_URL,
  ...AdapterUniapp(),
  timeout: 60 * 1000,
  statesHook: VueHook,
  shareRequest: false,
  // 设置为 null 即可全局关闭全部请求缓存
  cacheFor: null,

  beforeRequest: onAuthRequired(async (method) => {
    const appStore = useAppStore()
    const userStore = useUserStore()

    // 设置默认 Content-Type
    method.config.headers = {
      'ContentType': ContentTypeEnum.JSON,
      'Accept': 'application/json, text/plain, */*',
      'Appid': appStore.accountInfo?.miniProgram?.appId ?? '',
      ...method.config.headers,
      'X-Mnp-Appid': appStore.accountInfo?.miniProgram?.appId ?? '',
    }

    const { config } = method

    // 处理动态域名
    if (config.meta?.domain) {
      method.baseURL = config.meta.domain
      logger.log('当前域名', method)
      return
    }

    const useAuth = config.meta?.ignoreAuth !== true
    // 处理认证信息   自行处理认证问题
    let token: string
    if (useAuth) {
      try {
        token = await queue.push(userStore.getUserToken)
      }
      catch (error) {
        logger.addFilterMsg('GetTokenFail')
        logger.error('获取token失败 error', config, error)
        tips.confirm('获取token失败，请稍后再试')
        throw new Error('[接口错误]：获取token失败')
      }

      if (token) {
        method.config.headers.token = token
      }
      else {
        logger.addFilterMsg('GetTokenFail')
        logger.error('token 不能为空，已取消请求', config)
        throw new Error('[请求错误]：未登录')
      }
    }
  }),

  responded: onResponseRefreshToken({
    onSuccess: (response, method) => {
      const { requestType, meta } = method.config
      const {
        statusCode,
        data: rawData,
        errMsg,
      } = response as UniNamespace.RequestSuccessCallbackResult

      if (requestType === 'download') {
        return response
      }

      // 处理 HTTP 状态码错误
      if (statusCode !== 200) {
        logger.addFilterMsg('HttpRequestError')
        logger.error('Http Request Response Server error', response)

        const errorMessage = ShowMessage(statusCode) || `HTTP请求错误[${statusCode}]`
        console.error('errorMessage===>', errorMessage)
        if (meta?.alert !== false) {
          tips.confirm({
            content: errorMessage,
          })
        }
        throw new Error(`${errorMessage}：${errMsg}`)
      }

      const report = meta?.report !== false
      let responseData: any = rawData
      if (requestType === 'upload' && typeof rawData === 'string') {
        try {
          responseData = JSON.parse(rawData)
        }
        catch (err) {
          logger.addFilterMsg('UploadResponseParseError')
          logger.error('解析上传响应失败', rawData, err)
          throw new Error('解析上传响应失败')
        }
      }

      let __response: any
      try {
        // 内容 超出 5KB 会出现警告
        const _response = JSON.stringify(responseData)
        const toLog = _response.length > 1024 * 4
        __response = JSON.parse(_response)
        if (toLog) {
          __response.data = _response.slice(0, 1024 * 3)
        }
      }
      catch (err) { }

      // 外部域名，不走内部判断，直接返回请求结果
      if (meta?.domain) {
        report && logger.info('Http Request Response Success', __response)
        return responseData
      }

      // 处理业务逻辑错误
      const { code, msg, data } = responseData as Response
      if (code !== ResultEnum.Success) {
        if (meta?.alert !== false) {
          tips.confirm({
            content: msg,
          })
        }
        throw new Error(`请求错误[${code}]：${msg}`)
      }

      // 处理成功响应，返回业务数据
      report && logger.info('Http Request Response Success', responseData)
      return data
    },

    // 请求失败的拦截器
    // 请求错误时将会进入该拦截器。
    // 第二个参数为当前请求的method实例，你可以用它同步请求前后的配置信息
    onError: (response, method) => {
      const { statusCode, errMsg } = response
      const { meta } = method.config
      if (!statusCode) {
        throw new Error('请求取消')
      }
      logger.addFilterMsg('HttpRequestError')
      logger.error('Http Request Server error', response)

      const errorMessage = ShowMessage(statusCode) || `HTTP响应异常[${statusCode}]`
      if (meta?.alert !== false) {
        tips.confirm({
          content: errorMessage,
        })
      }
      throw new Error(`${errorMessage}：${errMsg}`)
    },

    // 请求完成的拦截器
    // 当你需要在请求不论是成功、失败、还是命中缓存都需要执行的逻辑时，可以在创建alova实例时指定全局的`onComplete`拦截器，例如关闭请求 loading 状态。
    // 接收当前请求的method实例
    onComplete: async (method) => {
      // 处理请求完成逻辑
      // console.log('服务器请求结束', method)
    },
  }),
})

export const http = alovaInstance
