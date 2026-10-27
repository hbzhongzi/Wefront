export namespace UserTypes {
  /** 小程序登录响应 */
  export interface LoginRes {
    /** 用户ID */
    id: number
    /** 用户编号 */
    sn: string
    /** 手机号 */
    mobile: string
    /** 昵称 */
    nickname: string
    /** 头像 */
    avatar: string
    /** 是否新用户：1是，0否 */
    is_new_user: number
    /** 当前小程序下是否存在有效腾讯广告点击归因：1是，0否 */
    is_ad_user: number
    /** 登录凭证 */
    token: string
  }

  /** 用户中心信息 */
  export interface UserInfo {
    /** 用户ID */
    id: number
    /** 用户编号 */
    sn: string
    /** 性别 */
    sex: number
    /** 账号 */
    account: string
    /** 昵称 */
    nickname: string
    /** 真实姓名 */
    real_name: string
    /** 头像 */
    avatar: string
    /** 手机号 */
    mobile: string
    /** 注册时间 */
    create_time: number
    /** 是否已设置密码 */
    has_password: boolean
    /** 当前微信终端是否授权 */
    is_auth?: number
    /** 是否新用户：1是，0否 */
    is_new_user: number
  }
}
