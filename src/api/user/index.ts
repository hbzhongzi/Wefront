import type { UserTypes } from './types.js'
import { http } from '@/http/alova'

/** 小程序登录：认证前置接口，按项目 HTTP 封装约定跳过认证。 */
export function fetchLogin(data: { code: string }) {
  return http.Post<UserTypes.LoginRes>('/login/mnpLogin', data, {
    meta: {
      ignoreAuth: true,
    },
  })
}

/** 刷新登录凭证：认证前置接口，按项目 HTTP 封装约定跳过认证。 */
export function fetchRefreshToken(data: { code: string }) {
  return http.Post<UserTypes.LoginRes>('/login/mnpLogin', data, {
    meta: {
      ignoreAuth: true,
      authRole: 'refreshToken',
    },
  })
}

/** 获取个人中心信息 */
export function fetchUserInfo() {
  return http.Get<UserTypes.UserInfo>('/user/center')
}
