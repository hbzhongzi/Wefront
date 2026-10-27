import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'
import { tabBar } from './src/tabbar/config'

export default defineUniPages({
  globalStyle: {
    navigationStyle: 'default',
    navigationBarTitleText: '模版小程序',
    navigationBarBackgroundColor: '#F6F7F9',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F6F7F9',
  },
  easycom: {
    autoscan: true,
    custom: {
      '^uv-(.*)': '@climblee/uv-ui/components/uv-$1/uv-$1.vue',
    },
  },
  subPackages: [
    {
      root: 'subpackages/watermark',
    },
  ],
  tabBar,
})
