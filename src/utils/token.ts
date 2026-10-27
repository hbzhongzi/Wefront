/**
 * token 方法
 */

import { useStorage } from './storage'

const storage = useStorage('user_')

const TOKEN_KEY = 'token'

/**
 * 获取本地存储的 token
 * @returns {string}
 */
export function getToken(): string {
  return storage.get(TOKEN_KEY) || ''
}

/**
 * 设置/删除 token
 * @param {string} token
 */
export function setToken(token: string = '') {
  storage.set(TOKEN_KEY, token)
}
