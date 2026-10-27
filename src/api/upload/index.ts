import type { UploadTypes } from './types'
import { http } from '@/http/alova'

/** 上传图片 */
export function fetchUploadImage(data: UploadTypes.UploadFileParams) {
  return http.Post<UploadTypes.FileInfo>('/upload/image', {
    filePath: data.filePath,
    name: data.name || 'file',
    cid: data.cid ?? 0,
  }, {
    requestType: 'upload',
  })
}

/** 上传视频 */
export function fetchUploadVideo(data: UploadTypes.UploadFileParams) {
  return http.Post<UploadTypes.FileInfo>('/upload/video', {
    filePath: data.filePath,
    name: data.name || 'file',
    cid: data.cid ?? 0,
  }, {
    requestType: 'upload',
  })
}

/** 上传文件 */
export function fetchUploadFile(data: UploadTypes.UploadFileParams) {
  return http.Post<UploadTypes.FileInfo>('/upload/file', {
    filePath: data.filePath,
    name: data.name || 'file',
    cid: data.cid ?? 0,
  }, {
    requestType: 'upload',
  })
}

/** 初始化直传 */
export function fetchUploadDirectInit(data: UploadTypes.DirectInitParams) {
  return http.Post<UploadTypes.DirectInitRes>('/upload/directInit', data)
}

/** 确认直传完成 */
export function fetchUploadDirectConfirm(data: UploadTypes.DirectConfirmParams) {
  return http.Post<UploadTypes.DirectConfirmRes>('/upload/directConfirm', data)
}
