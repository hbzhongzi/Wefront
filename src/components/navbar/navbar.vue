<script setup lang="ts">
import { getNavbarContentHeight } from '@/utils/systemInfo'

const props = withDefaults(defineProps<{
  /** 导航栏标题 */
  title?: string
  /** 页面滚动距离，用于控制导航栏背景透明度 */
  scrollTop?: number
  /** 是否显示左侧返回按钮 */
  showBack?: boolean
  /** 滚动后的导航栏背景色，支持 6 位十六进制颜色 */
  scrolledBgColor?: string
  /** 是否禁用滚动背景变化 */
  disableScrollBg?: boolean
}>(), {
  title: '',
  scrollTop: 0,
  showBack: true,
  scrolledBgColor: '#ffffff',
  disableScrollBg: false,
})

const emit = defineEmits<{
  back: []
}>()

const slots = useSlots()

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '').trim()
  if (!/^[0-9a-f]{6}$/i.test(normalized)) {
    return { r: 255, g: 255, b: 255 }
  }

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  }
}

/** 导航栏内容区高度 */
const navbarHeight = `${getNavbarContentHeight()}px`

const navbarBgColor = computed(() => {
  if (props.disableScrollBg) {
    return 'transparent'
  }

  const { r, g, b } = hexToRgb(props.scrolledBgColor)
  return `rgba(${r}, ${g}, ${b}, ${Math.min(1, props.scrollTop / 80)})`
})

function handleBack() {
  emit('back')
  uni.navigateBack()
}
</script>

<template>
  <uv-navbar
    :title="title"
    :bg-color="navbarBgColor"
    :border="false"
    :fixed="true"
    :placeholder="true"
    :z-index="100"
    :height="navbarHeight"
    left-icon-size="44rpx"
    left-icon-color="#111111"
    :left-icon="showBack ? 'arrow-left' : ''"
    @left-click="handleBack"
  >
    <template v-if="slots.left" #left>
      <slot name="left" />
    </template>

    <template #center>
      <slot v-if="slots.center" name="center" />
      <view v-else>
        {{ title }}
      </view>
    </template>

    <template v-if="slots.right" #right>
      <slot name="right" />
    </template>
  </uv-navbar>
</template>
