<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store'

definePage({
  style: {
    navigationBarTextStyle: 'black',
    navigationBarTitleText: '我的',
    navigationBarBackgroundColor: '#E0EDFF',
  },
})

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

onLoad((options) => {
  console.log('页面 onLoad', options, userInfo.value)
})
</script>

<template>
  <view class="page-container">
  </view>
</template>

<style>
page {
  background: #f6f7f9;
}
</style>

<style lang="scss" scoped>
.page-container {
}
</style>
