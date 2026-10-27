// main.js
import uvUI from '@climblee/uv-ui'
import { createSSRApp } from 'vue'
import App from './App.vue'

import { routeInterceptor } from './router/interceptor'
import store from './store'
import { useRefreshStore } from './store/refresh'
import '@/style/index.scss'

import 'virtual:uno.css'

export function createApp() {
  const app = createSSRApp(App)
  app.use(store)
  app.use(routeInterceptor)
  // app.use(requestInterceptor)

  app.mixin({
    onLoad() {
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      if (currentPage?.route) {
        useRefreshStore().recordVisitedTabbar(currentPage.route)
      }
    },
  })

  app.use(uvUI)

  return {
    app,
  }
}
