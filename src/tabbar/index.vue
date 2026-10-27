<script setup lang="ts">
import type { CustomTabBarItem } from './config'
import { customTabbarEnable, needHideNativeTabbar, tabbarCacheEnable } from './config'
import { tabbarList, tabbarStore } from './store'

// #ifdef MP-WEIXIN
// 将自定义节点设置成虚拟的（去掉自定义组件包裹层），更加接近Vue组件的表现，能更好的使用flex属性
defineOptions({
  virtualHost: true,
})
// #endif

/**
 * 中间的鼓包tabbarItem的点击事件
 */
function handleClickBulge() {
  uni.showToast({
    title: '点击了中间的鼓包tabbarItem',
    icon: 'none',
  })
}

function handleClick(index: number) {
  // 点击原来的不做操作
  if (index === tabbarStore.curIdx) {
    return
  }
  if (tabbarList[index].isBulge) {
    handleClickBulge()
    return
  }
  const url = tabbarList[index].pagePath
  tabbarStore.setCurIdx(index)
  if (tabbarCacheEnable) {
    uni.switchTab({ url })
  }
  else {
    uni.navigateTo({ url })
  }
}
// #ifndef MP-WEIXIN
// 因为有了 custom:true， 微信里面不需要多余的hide操作
onLoad(() => {
  // 解决原生 tabBar 未隐藏导致有2个 tabBar 的问题
  needHideNativeTabbar
  && uni.hideTabBar({
    fail(err) {
      console.log('hideTabBar fail: ', err)
    },
    success(res) {
      // console.log('hideTabBar success: ', res)
    },
  })
})
// #endif
const activeColor = 'var(--uni-color-primary, #1890ff)'
const inactiveColor = '#666'
function getColorByIndex(index: number) {
  return tabbarStore.curIdx === index ? activeColor : inactiveColor
}

function getImageByIndex(index: number, item: CustomTabBarItem) {
  if (!item.iconActive) {
    console.warn('image 模式下，需要配置 iconActive (高亮时的图片），否则无法切换高亮图片')
    return item.icon
  }
  return tabbarStore.curIdx === index ? item.iconActive : item.icon
}
</script>

<template>
  <view v-if="customTabbarEnable" class="tabbar-shell">
    <view class="border-and-fixed" @touchmove.stop.prevent>
      <view class="tabbar-row">
        <view
          v-for="(item, index) in tabbarList" :key="index"
          class="tabbar-item"
          :style="{ color: getColorByIndex(index) }"
          @click="handleClick(index)"
        >
          <view v-if="item.isBulge" class="bulge-wrapper">
            <!-- 中间一个鼓包tabbarItem的处理 -->
            <view class="bulge">
              <!-- TODO 2/2: 中间鼓包tabbarItem配置：通常是一个图片，或者icon，点击触发业务逻辑 -->
              <!-- 常见的是：扫描按钮、发布按钮、更多按钮等 -->
              <image class="bulge-image" src="/static/tabbar/scan.png" />
            </view>
          </view>
          <view v-else class="tabbar-item-content">
            <template v-if="item.iconType === 'uiLib'">
              <!-- TODO: 以下内容请根据选择的UI库自行替换 -->
              <!-- 如：<wd-icon name="home" /> (https://wot-design-uni.cn/component/icon.html) -->
              <!-- 如：<uv-icon name="home" /> (https://www.uvui.cn/components/icon.html) -->
              <uv-icon :name="item.icon" size="20" />
              <!-- 如：<sar-icon name="image" /> (https://sard.wzt.zone/sard-uniapp-docs/components/icon)(sar没有home图标^_^) -->
              <!-- <wd-icon :name="item.icon" size="20" /> -->
            </template>
            <template v-if="item.iconType === 'iconfont'">
              <view :class="item.icon" class="tabbar-iconfont" />
            </template>
            <template v-if="item.iconType === 'image'">
              <image :src="getImageByIndex(index, item)" mode="scaleToFill" class="tabbar-image" />
            </template>
            <view class="tabbar-text">
              {{ item.text }}
            </view>
            <!-- 角标显示 -->
            <view v-if="item.badge">
              <template v-if="item.badge === 'dot'">
                <view class="badge-dot" />
              </template>
              <template v-else>
                <view class="badge-count">
                  {{ item.badge > 99 ? '99+' : item.badge }}
                </view>
              </template>
            </view>
          </view>
        </view>
      </view>

      <view class="safe-area-spacer" />
    </view>
  </view>
</template>

<style scoped lang="scss">
.tabbar-shell {
  height: 50px;
  padding-bottom: env(safe-area-inset-bottom);
}

.border-and-fixed {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  border-top: 1px solid #eee;
  box-sizing: border-box;
  background-color: #fff;
}

.tabbar-row {
  display: flex;
  align-items: center;
  height: 50px;
}

.tabbar-item {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.tabbar-item-content {
  position: relative;
  padding: 0 12px;
  text-align: center;
}

.bulge-wrapper {
  position: relative;
}

.bulge-image {
  width: 200rpx;
  height: 200rpx;
  margin-top: 6rpx;
}

.tabbar-iconfont {
  font-size: 20px;
}

.tabbar-image {
  width: 20px;
  height: 20px;
}

.tabbar-text {
  margin-top: 2px;
  font-size: 12px;
}

.badge-dot {
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background-color: #f56c6c;
}

.badge-count {
  position: absolute;
  top: 0;
  right: -12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-width: 20px;
  height: 20px;
  padding: 0 4px;
  border-radius: 999px;
  background-color: #f56c6c;
  color: #fff;
  font-size: 12px;
  text-align: center;
}

.safe-area-spacer {
  padding-bottom: env(safe-area-inset-bottom);
}

// 中间鼓包的样式
.bulge {
  position: absolute;
  top: -20px;
  left: 50%;
  transform-origin: top center;
  transform: translateX(-50%) scale(0.5) translateY(-33%);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 250rpx;
  height: 250rpx;
  border-radius: 50%;
  background-color: #fff;
  box-shadow: inset 0 0 0 1px #fefefe;

  &:active {
    // opacity: 0.8;
  }
}
</style>
