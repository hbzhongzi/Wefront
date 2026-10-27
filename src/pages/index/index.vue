<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useAppStore, useUserStore } from '@/store'

definePage({
  type: 'home',
  style: {
    navigationBarTitleText: '首页',
    navigationBarTextStyle: 'black',
  },
})

/** 页面跳转表 */
const pageRoutes = {
  watermark: '/subpackages/watermark/editor',
} as const

/** 页面跳转标识 */
type PageRouteKey = keyof typeof pageRoutes

const appStore = useAppStore()
const userStore = useUserStore()
const { shareConfig } = storeToRefs(appStore)
const { userInfo } = storeToRefs(userStore)

/**
 * 按页面标识跳转
 */
function navigateToPage(key: PageRouteKey) {
  uni.navigateTo({ url: pageRoutes[key] })
}

onShareAppMessage(() => ({
  title: shareConfig.value.title || '首页',
  path: 'pages/index/index',
  imageUrl: shareConfig.value.image || '',
}))

// 分享朋友圈
onShareTimeline(() => ({
  title: shareConfig.value.title || '首页',
  path: 'pages/index/index',
  imageUrl: shareConfig.value.image || '',
}))

onLoad((options) => {
  console.log('页面 onLoad', options, userInfo.value)
})
</script>

<template>
  <view class="page-container">
    <!-- 引导用户将小程序添加到「我的小程序」 -->
    <view class="hero flex flex-col">
      <text class="title">我是首页</text>
      <view
        class="entry flex items-center justify-center"
        @click="navigateToPage('watermark')"
      >
        <text class="entry-text">照片加水印</text>
      </view>
    </view>
  </view>
</template>

<style>
page {
  background-color: #f2f3f7;
}
</style>

<style lang="scss" scoped>
.page-container {
  .hero {
    padding: 48rpx 32rpx;
  }

  .title {
    color: #17191c;
    font-size: 32rpx;
  }

  .entry {
    margin-top: 32rpx;
    height: 88rpx;
    border-radius: 16rpx;
    background-color: #1677ff;
  }

  .entry-text {
    color: #fff;
    font-size: 30rpx;
    font-weight: 600;
  }
}
</style>
