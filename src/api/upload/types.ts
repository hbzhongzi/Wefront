/** 上传接口类型 */
export namespace UploadTypes {
  /** 素材类型：10图片，20视频，30文件 */
  export type FileType = 10 | 20 | 30

  /** 上传文件结果 */
  export interface FileInfo {
    /** 素材ID */
    id: number
    /** 素材分组ID */
    cid: number
    /** 素材类型：10图片，20视频，30文件 */
    type: number
    /** 文件名 */
    name: string
    /** 5分钟有效的文件签名访问地址 */
    uri: string
    /** 兼容字段，同为短期签名访问地址 */
    url: string
    /** 内容安全状态 */
    security_status?: number
  }

  /** 本地文件上传参数 */
  export interface UploadFileParams {
    /** 本地临时文件路径 */
    filePath: string
    /** 表单字段名，默认 file */
    name?: string
    /** 素材分组ID，默认0 */
    cid?: number
  }

  /** 初始化直传参数 */
  export interface DirectInitParams {
    /** 文件名 */
    file_name: string
    /** 文件大小（字节） */
    file_size: number
    /** 素材类型：10图片，20视频，30文件 */
    type: FileType
    /** 素材分组ID，默认0 */
    cid?: number
  }

  /** 初始化直传响应 */
  export interface DirectInitRes {
    /** 直传上传地址 */
    upload_url: string
    /** 云存储文件路径 */
    file_key: string
    /** 过期时间戳 */
    expires: number
    /** 上传请求方法 */
    method: string
    /** 上传请求头 */
    headers: Record<string, string>
    /** 表单直传参数 */
    form_data: Record<string, string>
    /** 文件 MIME 类型 */
    content_type: string
    /** 文件名 */
    file_name: string
    /** 文件大小 */
    file_size: number
    /** 素材类型 */
    type: number
    /** 素材分组ID */
    cid: number
    /** 确认直传时必须原样提交的短期上传凭证 */
    upload_intent: string
  }

  /** 确认直传完成参数 */
  export interface DirectConfirmParams {
    /** 初始化直传返回的云存储文件路径 */
    file_key: string
    /** 初始化直传时提交的文件名 */
    file_name: string
    /** 初始化直传时提交的文件大小 */
    file_size: number
    /** 素材类型：10图片，20视频，30文件 */
    type: FileType
    /** 素材分组ID，默认0 */
    cid?: number
    /** 初始化直传返回的短期上传凭证 */
    upload_intent: string
  }

  /** 确认直传完成响应 */
  export interface DirectConfirmRes {
    /** 素材ID */
    id: number
    /** 素材分组ID */
    cid: number
    /** 素材类型：10图片，20视频，30文件 */
    type: number
    /** 文件名 */
    name: string
    /** 5分钟有效的文件签名访问地址 */
    uri: string
    /** 兼容字段，同为短期签名访问地址 */
    url: string
    /** 文件大小 */
    file_size: number
  }
}
