<script lang="ts" setup>
import { getCurrentInstance } from 'vue'
import type { UploadTypes } from '@/api/upload/types'
import { fetchUploadImage } from '@/api/upload'
import tips from '@/utils/tips'
import { drawTiledWatermark } from './utils/draw-watermark'
import { WATERMARK_TEMPLATE_GROUPS } from './utils/templates'

definePage({
  style: {
    navigationBarTitleText: '照片加水印',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTextStyle: 'black',
    disableScroll: true,
  },
})

/** 工具类型 */
type ToolType = 'text' | 'font' | 'opacity' | 'color' | 'angle' | 'spacing'

/** 颜色色板 */
const COLOR_SWATCHES = [
  { color: '#000000', label: '黑色' },
  { color: '#ffffff', label: '白色' },
  { color: '#888888', label: '灰色' },
  { color: '#ff3b30', label: '红色' },
  { color: '#ff7a00', label: '橙色' },
  { color: '#ffb719', label: '黄色' },
  { color: '#1677ff', label: '蓝色' },
  { color: '#6d31d9', label: '紫色' },
  { color: '#ee2f9a', label: '粉色' },
] as const

/** 默认水印文案 */
const DEFAULT_TEXT = '仅用于XXX使用'

/** 内容安全检测通过 */
const SECURITY_PASSED = 2

/** 工具栏配置 */
const TOOL_ITEMS: { key: ToolType; label: string; icon: string }[] = [
  { key: 'text', label: '文字', icon: 'text' },
  { key: 'font', label: '字号', icon: 'font' },
  { key: 'opacity', label: '透明', icon: 'opacity' },
  { key: 'color', label: '颜色', icon: 'color' },
  { key: 'angle', label: '角度', icon: 'angle' },
  { key: 'spacing', label: '间距', icon: 'spacing' },
]

/** 当前页面实例，用于 canvas 查询 */
const pageInstance = getCurrentInstance()

/** 水印文字 */
const watermarkText = ref(DEFAULT_TEXT)

/** 字号 */
const fontSize = ref(15)

/** 透明度 */
const opacity = ref(0.55)

/** 颜色 */
const color = ref('#888888')

/** 旋转角度（对齐示例约 -30°） */
const angle = ref(-30)

/** 间距 1~100（对齐示例默认偏疏） */
const spacing = ref(50)

/** 当前工具 */
const activeTool = ref<ToolType>('text')

/** 是否已选图 */
const hasImage = ref(false)

/** 原图本地路径 */
const imagePath = ref('')

/** 原图宽 */
const imageWidth = ref(0)

/** 原图高 */
const imageHeight = ref(0)

/** 画布预览展示尺寸（等比适应预览区，避免拉伸变形） */
const canvasDisplayStyle = ref<Record<string, string>>({})

/** 模板弹窗实例 */
const templatePopupRef = ref<{ open: (type?: string) => void, close: () => void }>()

/** 是否正在保存 */
const saving = ref(false)

/** 画布节点 */
let canvasNode: any = null

/** 画布 2d 上下文 */
let canvasCtx: CanvasRenderingContext2D | null = null

/** 画布内缓存的图片对象 */
let canvasImage: any = null

/** 是否展示文字输入条 */
const showMetadataBar = computed(() => activeTool.value === 'text')

/** 是否展开工具面板 */
const showToolPanel = computed(() => activeTool.value !== 'text')

/** 面板标题 */
const panelTitle = computed(() => {
  const map: Record<ToolType, string> = {
    text: '文字设置',
    font: '字号设置',
    opacity: '透明度设置',
    color: '颜色设置',
    angle: '旋转角度',
    spacing: '水印间距',
  }
  return map[activeTool.value]
})

/** 面板右侧数值 */
const panelTitleValue = computed(() => {
  if (activeTool.value === 'angle') return `${angle.value}°`
  if (activeTool.value === 'spacing') return String(spacing.value)
  return ''
})

/**
 * 获取 type=2d canvas 节点与上下文
 */
async function ensureCanvas() {
  if (canvasNode && canvasCtx) return { canvas: canvasNode, ctx: canvasCtx }

  const result = await new Promise<{
    node: any
    width: number
    height: number
  } | null>((resolve) => {
    const query = uni.createSelectorQuery()
    // #ifdef MP-WEIXIN
    if (pageInstance?.proxy) query.in(pageInstance.proxy as any)
    // #endif
    query
      .select('#wmCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        const data = res?.[0]
        if (!data?.node) {
          resolve(null)
          return
        }
        resolve(data as { node: any; width: number; height: number })
      })
  })

  if (!result) {
    tips.toast('画布初始化失败')
    return null
  }

  canvasNode = result.node
  canvasCtx = canvasNode.getContext('2d') as CanvasRenderingContext2D
  return { canvas: canvasNode, ctx: canvasCtx }
}

/** 与 `.stage` 的 padding 保持一致（单侧 rpx） */
const STAGE_PADDING_RPX = 50

/**
 * 测量预览舞台内容区可用宽高（已扣除 stage padding）
 */
async function measureStageSize() {
  return new Promise<{ width: number, height: number } | null>((resolve) => {
    const query = uni.createSelectorQuery()
    // #ifdef MP-WEIXIN
    if (pageInstance?.proxy)
      query.in(pageInstance.proxy as any)
    // #endif
    query
      .select('.stage')
      .boundingClientRect((rect) => {
        if (!rect || Array.isArray(rect) || !rect.width || !rect.height) {
          resolve(null)
          return
        }
        const pad = uni.upx2px(STAGE_PADDING_RPX) * 2
        resolve({
          width: Math.max(rect.width - pad, 1),
          height: Math.max(rect.height - pad, 1),
        })
      })
      .exec()
  })
}

/**
 * 按预览区计算画布 CSS 尺寸，保持原图比例（类似 object-fit: contain）
 */
async function updateCanvasDisplaySize() {
  if (!imageWidth.value || !imageHeight.value)
    return

  await nextTick()
  const stageSize = await measureStageSize()
  if (!stageSize?.width || !stageSize?.height)
    return

  const scale = Math.min(
    stageSize.width / imageWidth.value,
    stageSize.height / imageHeight.value,
  )
  canvasDisplayStyle.value = {
    width: `${Math.floor(imageWidth.value * scale)}px`,
    height: `${Math.floor(imageHeight.value * scale)}px`,
  }
}

/**
 * 按当前参数重绘预览
 */
async function redraw() {
  if (!hasImage.value || !imagePath.value)
    return

  await updateCanvasDisplaySize()

  const canvasRef = await ensureCanvas()
  if (!canvasRef)
    return

  const { canvas, ctx } = canvasRef
  const width = imageWidth.value
  const height = imageHeight.value
  if (!width || !height)
    return

  canvas.width = width
  canvas.height = height

  if (!canvasImage) {
    canvasImage = canvas.createImage()
    await new Promise<void>((resolve, reject) => {
      canvasImage.onload = () => resolve()
      canvasImage.onerror = () => reject(new Error('image load failed'))
      canvasImage.src = imagePath.value
    }).catch(() => {
      tips.toast('图片加载失败')
    })
  }

  if (!canvasImage)
    return

  ctx.clearRect(0, 0, width, height)
  ctx.drawImage(canvasImage, 0, 0, width, height)
  drawTiledWatermark(ctx, width, height, {
    text: watermarkText.value,
    fontSize: fontSize.value,
    opacity: opacity.value,
    color: color.value,
    angle: angle.value,
    spacing: spacing.value,
  })
}

/**
 * 选择图片（相册 / 拍摄），先上传做内容安全校验，通过后再进入编辑
 */
function chooseImage() {
  uni.chooseMedia({
    count: 1,
    mediaType: ['image'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const file = res.tempFiles?.[0]
      if (!file?.tempFilePath) {
        tips.toast('请选择图片文件')
        return
      }

      tips.loading('图片校验中')
      try {
        const uploaded = await uploadAndValidateImage(file.tempFilePath)
        if (!uploaded)
          return

        const info = await new Promise<UniApp.GetImageInfoSuccessData>(
          (resolve, reject) => {
            uni.getImageInfo({
              src: file.tempFilePath,
              success: resolve,
              fail: reject,
            })
          },
        )
        imagePath.value = file.tempFilePath
        imageWidth.value = info.width
        imageHeight.value = info.height
        canvasImage = null
        hasImage.value = true
        await nextTick()
        await redraw()
      }
      catch {
        tips.toast('图片校验失败，请重试')
      }
      finally {
        tips.hideLoading()
      }
    },
  })
}

/**
 * 切换底部工具
 */
function openTool(tool: ToolType) {
  activeTool.value = tool
}

/**
 * 清空水印文字
 */
function clearText() {
  watermarkText.value = ''
  void redraw()
}

/**
 * 当前输入文字是否与某条模板一致（用于默认选中样式）
 */
function isTemplateSelected(text: string) {
  return text.trim() === watermarkText.value.trim()
}

/**
 * 打开模板选择弹窗
 */
function openTemplatePopup() {
  templatePopupRef.value?.open()
}

/**
 * 关闭模板选择弹窗
 */
function closeTemplatePopup() {
  templatePopupRef.value?.close()
}

/**
 * 选择模板文案并应用到水印
 */
function selectTemplateText(text: string) {
  watermarkText.value = text
  void redraw()
  closeTemplatePopup()
  tips.toast('已应用模板')
}

/**
 * 重置水印参数
 */
function resetSettings() {
  watermarkText.value = DEFAULT_TEXT
  fontSize.value = 15
  opacity.value = 0.55
  color.value = '#888888'
  angle.value = -30
  spacing.value = 50
  void redraw()
  tips.toast('设置已重置')
}

/**
 * 选择颜色
 */
function selectColor(nextColor: string) {
  color.value = nextColor
  void redraw()
}

/**
 * 将当前加水印画布导出为临时图片路径
 */
async function exportWatermarkedTempPath() {
  await redraw()
  const canvasRef = await ensureCanvas()
  if (!canvasRef)
    return ''

  return new Promise<string>((resolve, reject) => {
    uni.canvasToTempFilePath({
      canvas: canvasRef.canvas,
      fileType: 'png',
      quality: 1,
      success: res => resolve(res.tempFilePath),
      fail: reject,
    })
  })
}

/**
 * 预览加水印后的图片
 */
async function handlePreview() {
  if (!hasImage.value) {
    tips.toast('请先添加一张图片')
    return
  }

  tips.loading('生成预览')
  try {
    const tempPath = await exportWatermarkedTempPath()
    if (!tempPath) {
      tips.toast('预览生成失败')
      return
    }
    uni.previewImage({
      urls: [tempPath],
      current: tempPath,
    })
  }
  catch {
    tips.toast('预览生成失败')
  }
  finally {
    tips.hideLoading()
  }
}

/**
 * 上传图片并校验内容安全，通过返回上传结果，否则返回 null
 */
async function uploadAndValidateImage(filePath: string) {
  const uploaded = await fetchUploadImage({
    filePath,
  }) as UploadTypes.FileInfo

  if (
    uploaded.security_status !== undefined
    && uploaded.security_status !== SECURITY_PASSED
  ) {
    tips.toast('图片未通过安全检测，请更换后重试')
    return null
  }

  return uploaded
}

/**
 * 保存带水印图片：先上传校验，再写入相册
 */
async function handleSave() {
  if (!hasImage.value) {
    tips.toast('请先添加一张图片')
    return
  }
  if (saving.value)
    return

  saving.value = true
  tips.loading('保存中')
  try {
    const tempPath = await exportWatermarkedTempPath()
    if (!tempPath) {
      tips.toast('保存失败，请重试')
      return
    }

    tips.loading('上传校验中')
    const uploaded = await uploadAndValidateImage(tempPath)
    if (!uploaded)
      return

    tips.loading('保存中')
    await new Promise<void>((resolve, reject) => {
      uni.saveImageToPhotosAlbum({
        filePath: tempPath,
        success: () => resolve(),
        fail: reject,
      })
    })
    tips.toast('已保存带水印图片')
  }
  catch (error: any) {
    const msg = String(error?.errMsg || error?.message || '')
    if (msg.includes('auth deny') || msg.includes('authorize')) {
      const confirmed = await tips.confirm({
        title: '需要相册权限',
        content: '请在设置中允许保存到相册',
        showCancel: true,
        confirmText: '去设置',
      })
      if (confirmed)
        uni.openSetting({})
    }
    else if (msg.includes('请求错误') || msg.includes('上传') || msg.includes('HTTP')) {
      tips.toast('图片上传失败，请重试')
    }
    else {
      tips.toast('保存失败，请重试')
    }
  }
  finally {
    saving.value = false
    tips.hideLoading()
  }
}

watch([watermarkText, fontSize, opacity, color, angle, spacing], () => {
  if (hasImage.value)
    void redraw()
})

/** 工具面板显隐会改变预览区高度，需重新等比适配 */
watch([showMetadataBar, showToolPanel], async () => {
  if (!hasImage.value)
    return
  await nextTick()
  await updateCanvasDisplaySize()
})
</script>

<template>
  <view class="page-container">
    <view class="editor fixed top-0 right-0 bottom-0 left-0 flex flex-col overflow-hidden">
      <view class="work flex flex-col flex-1 min-h-0">
        <view
          class="stage relative flex flex-col items-center justify-center flex-1 min-h-0"
          :class="{ 'stage--has': hasImage }"
          @click="chooseImage"
        >
          <canvas
            v-show="hasImage"
            id="wmCanvas"
            type="2d"
            class="canvas"
            :style="canvasDisplayStyle"
            @click.stop="chooseImage"
          />
          <view v-if="!hasImage" class="empty flex flex-col items-center">
            <view class="plus flex items-center justify-center">
              <text class="plus-text">＋</text>
            </view>
            <text class="empty-title">点击添加图片</text>
            <text class="empty-sub">支持从相册选择或拍摄</text>
          </view>
        </view>

        <view
          v-show="showMetadataBar"
          class="meta flex flex-row items-center flex-none"
        >
          <input
            v-model="watermarkText"
            class="meta-input flex-1"
            maxlength="40"
            placeholder="仅用于XXX使用"
            @click.stop
          />
          <view
            class="clear flex items-center justify-center flex-none"
            @click.stop="clearText"
          >
            <text class="clear-x">×</text>
          </view>
          <view
            class="tpl flex items-center justify-center flex-none"
            @click.stop="openTemplatePopup"
          >
            <text class="tpl-text">模板</text>
          </view>
        </view>

        <view v-if="showToolPanel" class="panel flex-none">
          <view class="panel-head flex flex-row items-center justify-between">
            <text class="panel-title">{{ panelTitle }}</text>
            <view class="panel-head-right flex flex-row items-center">
              <text v-if="panelTitleValue" class="panel-title-value">{{
                panelTitleValue
              }}</text>
              <text class="reset-link" @click="resetSettings">重置</text>
            </view>
          </view>

          <view
            v-if="activeTool === 'font'"
            class="panel-row flex flex-row items-center"
          >
            <slider
              class="flex-1"
              :value="fontSize"
              :min="10"
              :max="32"
              :step="1"
              activeColor="#1677ff"
              backgroundColor="#e5e8ec"
              block-size="16"
              @changing="(e: any) => (fontSize = Number(e.detail.value))"
              @change="(e: any) => (fontSize = Number(e.detail.value))"
            />
            <text class="value flex-none">{{ fontSize }} px</text>
          </view>

          <view
            v-else-if="activeTool === 'opacity'"
            class="panel-row flex flex-row items-center"
          >
            <slider
              class="flex-1"
              :value="opacity * 10"
              :min="1"
              :max="10"
              :step="1"
              activeColor="#1677ff"
              backgroundColor="#e5e8ec"
              block-size="16"
              @changing="(e: any) => (opacity = Number(e.detail.value) / 10)"
              @change="(e: any) => (opacity = Number(e.detail.value) / 10)"
            />
            <text class="value flex-none"
              >{{ Math.round(opacity * 100) }}%</text
            >
          </view>

          <view
            v-else-if="activeTool === 'color'"
            class="swatches flex flex-row items-center justify-between"
          >
            <view
              v-for="item in COLOR_SWATCHES"
              :key="item.color"
              class="swatch flex-none"
              :class="{ 'swatch--active': color === item.color }"
              :style="{ backgroundColor: item.color }"
              @click="selectColor(item.color)"
            />
          </view>

          <view v-else-if="activeTool === 'angle'" class="panel-full">
            <slider
              :value="angle"
              :min="-180"
              :max="180"
              :step="1"
              activeColor="#1677ff"
              backgroundColor="#e5e8ec"
              block-size="16"
              @changing="(e: any) => (angle = Number(e.detail.value))"
              @change="(e: any) => (angle = Number(e.detail.value))"
            />
          </view>

          <view v-else-if="activeTool === 'spacing'" class="panel-full">
            <slider
              :value="spacing"
              :min="1"
              :max="100"
              :step="1"
              activeColor="#1677ff"
              backgroundColor="#e5e8ec"
              block-size="16"
              @changing="(e: any) => (spacing = Number(e.detail.value))"
              @change="(e: any) => (spacing = Number(e.detail.value))"
            />
          </view>
        </view>

        <view class="toolbar flex flex-row flex-none">
          <view
            v-for="item in TOOL_ITEMS"
            :key="item.key"
            class="tool relative flex flex-1 flex-col items-center"
            :class="{ 'tool--active': activeTool === item.key }"
            @click="openTool(item.key)"
          >
            <view class="tool-icon" :class="`tool-icon--${item.icon}`" />
            <text class="tool-label">{{ item.label }}</text>
          </view>
        </view>
      </view>

      <view class="actions flex flex-row flex-none">
        <view
          class="preview flex items-center justify-center"
          @click="handlePreview"
        >
          <text class="preview-text">预览</text>
        </view>
        <view
          class="save flex flex-1 flex-row items-center justify-center"
          @click="handleSave"
        >
          <view class="download-icon" />
          <text class="save-text">保存图片</text>
        </view>
      </view>
    </view>

    <uv-popup
      ref="templatePopupRef"
      mode="bottom"
      round="24rpx"
      :safe-area-inset-bottom="true"
      :close-on-click-overlay="true"
    >
      <view class="tpl-dialog flex flex-col">
        <view class="tpl-head flex flex-row items-center justify-between">
          <text class="tpl-title">选择模板</text>
          <view class="tpl-close flex items-center justify-center" @click="closeTemplatePopup">
            <text class="tpl-close-x">×</text>
          </view>
        </view>
        <scroll-view scroll-y class="tpl-scroll">
          <view
            v-for="group in WATERMARK_TEMPLATE_GROUPS"
            :key="group.title"
            class="tpl-group"
          >
            <view class="tpl-group-title">
              <text class="tpl-group-title-text">{{ group.title }}</text>
            </view>
            <view
              v-for="item in group.items"
              :key="item"
              class="tpl-item flex flex-row items-center justify-between"
              :class="{ 'tpl-item--active': isTemplateSelected(item) }"
              @click="selectTemplateText(item)"
            >
              <text class="tpl-item-text flex-1 min-w-0">{{ item }}</text>
              <text v-if="isTemplateSelected(item)" class="tpl-item-check flex-none">✓</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </uv-popup>
  </view>
</template>

<style>
page {
  background-color: #ffffff;
  height: 100%;
  overflow: hidden;
}
</style>

<style lang="scss" scoped>
.page-container {
  .editor {
    background-color: #fff;
  }

  .work {
    padding: 12rpx 24rpx 0;
  }

  .stage {
    overflow: hidden;
    border: 2rpx dashed #e0e3e7;
    border-radius: 22rpx;
    background-color: #fff;
    padding: 50rpx;
  }

  .stage--has {
    border-color: transparent;
  }

  .canvas {
    max-width: 100%;
    max-height: 100%;
  }

  .empty {
    transform: translateY(-6rpx);
  }

  .plus {
    width: 80rpx;
    height: 80rpx;
    margin-bottom: 16rpx;
    border-radius: 50%;
    background-color: #eff6ff;
  }

  .plus-text {
    color: #1677ff;
    font-size: 52rpx;
    font-weight: 200;
    line-height: 1;
  }

  .empty-title {
    color: #17191c;
    font-size: 30rpx;
    font-weight: 500;
  }

  .empty-sub {
    margin-top: 12rpx;
    color: #9aa0a8;
    font-size: 24rpx;
  }

  .meta {
    height: 80rpx;
    margin: 16rpx 0 10rpx;
    padding: 0 20rpx 0 24rpx;
    border: 2rpx solid #e7e9eb;
    border-radius: 12rpx;
    background-color: #fafafa;
    box-sizing: border-box;
  }

  .meta-input {
    min-width: 0;
    height: 80rpx;
    color: #17191c;
    font-size: 28rpx;
    background-color: transparent;
  }

  .clear {
    width: 48rpx;
    height: 48rpx;
    margin-left: 16rpx;
    border-radius: 50%;
    background-color: #f0f1f2;
  }

  .clear-x {
    color: #aeb4ba;
    font-size: 34rpx;
    line-height: 1;
  }

  .tpl {
    margin-left: 16rpx;
    padding: 16rpx 22rpx;
    border-radius: 10rpx;
    background-color: #edf5ff;
  }

  .tpl-text {
    color: #1677ff;
    font-size: 26rpx;
    white-space: nowrap;
  }

  .panel {
    margin: 0 -24rpx;
    padding: 12rpx 28rpx 8rpx;
    background-color: #fff;
  }

  .panel-head {
    margin-bottom: 8rpx;
  }

  .panel-title {
    color: #777f89;
    font-size: 22rpx;
  }

  .panel-title-value {
    margin-right: 16rpx;
    color: #1677ff;
    font-size: 24rpx;
  }

  .panel-row,
  .panel-full {
    padding: 0 8rpx;
  }

  .value {
    width: 90rpx;
    margin-left: 8rpx;
    color: #59616b;
    font-size: 22rpx;
    text-align: right;
  }

  .swatches {
    padding: 4rpx 4rpx 8rpx;
  }

  .swatch {
    width: 48rpx;
    height: 48rpx;
    border: 4rpx solid #fff;
    border-radius: 50%;
    box-shadow: 0 0 0 2rpx #d9dde2;
  }

  .swatch--active {
    box-shadow: 0 0 0 4rpx #1677ff;
  }

  .reset-link {
    color: #8f969f;
    font-size: 22rpx;
  }

  .toolbar {
    min-height: 100rpx;
    margin: 0 -24rpx;
    padding: 8rpx 12rpx 10rpx;
    border-top: 2rpx solid #edf0f2;
    box-sizing: border-box;
  }

  .tool {
    padding: 4rpx 0 8rpx;
  }

  .tool-icon {
    width: 32rpx;
    height: 36rpx;
    margin-bottom: 4rpx;
    position: relative;
  }

  .tool-icon--text::before {
    content: 'A';
    position: absolute;
    top: -4rpx;
    left: 2rpx;
    color: currentColor;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 30rpx;
    font-weight: 600;
    line-height: 36rpx;
  }

  .tool-icon--text::after {
    content: 'a';
    position: absolute;
    top: 8rpx;
    left: 18rpx;
    color: currentColor;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 24rpx;
    font-weight: 600;
    line-height: 30rpx;
    text-decoration: underline;
  }

  .tool-icon--font::before {
    content: 'A';
    position: absolute;
    top: -2rpx;
    left: 0;
    color: currentColor;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 32rpx;
    font-weight: 600;
    line-height: 36rpx;
  }

  .tool-icon--font::after {
    content: '';
    position: absolute;
    top: 10rpx;
    right: 0;
    width: 14rpx;
    height: 2rpx;
    border-radius: 2rpx;
    background-color: currentColor;
    box-shadow:
      0 8rpx 0 currentColor,
      0 16rpx 0 currentColor;
  }

  .tool-icon--opacity {
    width: 30rpx;
    height: 30rpx;
    margin: 6rpx 0 10rpx 2rpx;
    border-radius: 50%;
    border: 2rpx solid currentColor;
    overflow: hidden;
  }

  .tool-icon--opacity::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 50%;
    background-color: currentColor;
  }

  .tool-icon--color {
    width: 30rpx;
    height: 30rpx;
    margin-top: 6rpx;
    margin-bottom: 10rpx;
    border: 2rpx solid rgba(23, 25, 28, 0.12);
    border-radius: 50%;
    background: conic-gradient(
      #ff3b30 0 25%,
      #ffb719 25% 50%,
      #31b67a 50% 75%,
      #1677ff 75% 100%
    );
    box-shadow: 0 2rpx 4rpx rgba(23, 25, 28, 0.14);
  }

  .tool-icon--color::after {
    content: '';
    position: absolute;
    left: 8rpx;
    top: 8rpx;
    right: 8rpx;
    bottom: 8rpx;
    border-radius: 50%;
    background-color: #fff;
    box-shadow: 0 0 0 2rpx rgba(23, 25, 28, 0.08);
  }

  .tool-icon--angle::before {
    content: '';
    position: absolute;
    left: 4rpx;
    top: 4rpx;
    right: 4rpx;
    bottom: 4rpx;
    border: 3rpx solid currentColor;
    border-left-color: transparent;
    border-radius: 50%;
    transform: rotate(-32deg);
  }

  .tool-icon--angle::after {
    content: '';
    position: absolute;
    top: 2rpx;
    right: 2rpx;
    width: 10rpx;
    height: 10rpx;
    border-top: 3rpx solid currentColor;
    border-right: 3rpx solid currentColor;
    transform: rotate(18deg);
  }

  .tool-icon--spacing::before {
    content: '';
    position: absolute;
    left: 8rpx;
    top: 8rpx;
    right: 8rpx;
    bottom: 8rpx;
    border: 2rpx solid currentColor;
    border-radius: 4rpx;
  }

  .tool-icon--spacing::after {
    content: '';
    position: absolute;
    top: 16rpx;
    left: 16rpx;
    width: 4rpx;
    height: 4rpx;
    border-radius: 50%;
    background-color: currentColor;
    box-shadow:
      -10rpx -10rpx 0 currentColor,
      10rpx -10rpx 0 currentColor,
      -10rpx 10rpx 0 currentColor,
      10rpx 10rpx 0 currentColor;
  }

  .tool-label {
    color: #8f969f;
    font-size: 24rpx;
    line-height: 1.2;
  }

  .tool,
  .tool-icon {
    color: #8f969f;
  }

  .tool--active,
  .tool--active .tool-icon,
  .tool--active .tool-label {
    color: #1677ff;
  }

  .tool--active::after {
    content: '';
    width: 36rpx;
    height: 4rpx;
    position: absolute;
    bottom: 0;
    left: 50%;
    border-radius: 4rpx;
    background-color: #1677ff;
    transform: translateX(-50%);
  }

  .actions {
    min-height: 96rpx;
    border-top: 2rpx solid #edf0f2;
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
    box-sizing: content-box;
  }

  .preview {
    width: 200rpx;
    height: 96rpx;
    background-color: #fff;
  }

  .preview-text {
    color: #191b1f;
    font-size: 28rpx;
  }

  .save {
    height: 96rpx;
    background-color: #1677ff;
  }

  .download-icon {
    width: 28rpx;
    height: 28rpx;
    margin-right: 16rpx;
    position: relative;
    border-bottom: 3rpx solid #fff;
  }

  .download-icon::before {
    content: '';
    position: absolute;
    left: 12rpx;
    top: -4rpx;
    width: 3rpx;
    height: 18rpx;
    background-color: #fff;
  }

  .download-icon::after {
    content: '';
    position: absolute;
    left: 6rpx;
    top: 6rpx;
    width: 12rpx;
    height: 12rpx;
    border-right: 3rpx solid #fff;
    border-bottom: 3rpx solid #fff;
    transform: rotate(45deg);
  }

  .save-text {
    color: #fff;
    font-size: 32rpx;
    font-weight: 600;
  }
}

/* 模板弹窗可能脱离 page-container 层级，样式独立写出保证选中态生效 */
.tpl-dialog {
  width: 100%;
  height: 70vh;
  background-color: #fff;
  overflow: hidden;
}

.tpl-head {
  height: 96rpx;
  padding: 0 28rpx;
  border-bottom: 2rpx solid #f0f1f3;
  box-sizing: border-box;
}

.tpl-title {
  color: #17191c;
  font-size: 32rpx;
  font-weight: 600;
}

.tpl-close {
  width: 48rpx;
  height: 48rpx;
}

.tpl-close-x {
  color: #999;
  font-size: 40rpx;
  line-height: 1;
}

.tpl-scroll {
  height: 62vh;
}

.tpl-group-title {
  padding: 16rpx 28rpx;
  background-color: #f5f6f8;
}

.tpl-group-title-text {
  color: #666;
  font-size: 24rpx;
}

.tpl-item {
  min-height: 88rpx;
  padding: 24rpx 28rpx;
  border-bottom: 2rpx solid #f0f1f3;
  box-sizing: border-box;
}

.tpl-item--active {
  background-color: #eef6ff;
}

.tpl-item-text {
  color: #17191c;
  font-size: 28rpx;
  line-height: 1.4;
}

.tpl-item--active .tpl-item-text {
  color: #1677ff;
  font-weight: 500;
}

.tpl-item-check {
  margin-left: 24rpx;
  color: #1677ff;
  font-size: 36rpx;
  font-weight: 500;
  line-height: 1;
}
</style>
