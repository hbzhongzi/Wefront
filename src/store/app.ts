import { defineStore } from 'pinia'
import { systemInfo } from '@/utils/systemInfo'

export interface ShareConfig {
  title: string
  description: string
  image: string
}

export const useAppStore = defineStore('app', {
  state: () => {
    const fallbackName = import.meta.env.VITE_APP_TITLE || ''
    let miniProgramName = fallbackName
    let miniProgramIcon = ''

    // #ifdef MP-WEIXIN
    const wxConfig = (globalThis as any).__wxConfig
    const accountInfo = wxConfig?.accountInfo
    miniProgramName = accountInfo?.nickname || fallbackName
    miniProgramIcon = accountInfo?.icon || ''
    // #endif

    return {
      systemInfo,
      accountInfo: uni.getAccountInfoSync(),
      miniProgramInfo: {
        name: miniProgramName,
        icon: miniProgramIcon,
      },
      shareConfig: {
        title: '',
        description: '',
        image: '',
      } as ShareConfig,
      launchOptions: {} as App.LaunchShowOption,
      appOptions: {} as App.LaunchShowOption,
    }
  },

  getters: {
    os(state) {
      return state.systemInfo.platform.toLowerCase()
    },
  },

  actions: {
    setLaunchOptions(options: App.LaunchShowOption) {
      options && (this.launchOptions = options)
    },
    setAppOptions(options: App.LaunchShowOption) {
      options && (this.appOptions = options)
    },
  },
})
