# Vue 页面开发规范

目标：用标准页面骨架约束 `src/pages/**`、`src/subpackages/**` 下的页面文件。公共能力复用见 `mp-framework.md`。

## 1. 适用范围

本文件只约束页面层产出形态，重点回答以下问题：

- 页面骨架应该怎么搭
- 当前页面使用原生导航还是自定义 `Navbar`
- 模板里的布局类、class、SCSS 各自负责什么
- 哪些静态内容应直接写模板，哪些才允许提到 `script`
- 页面内生命周期、刷新和局部交互应承接到什么边界

本文件不定义公共能力复用细节；涉及 `Navbar` 以外的分页列表、底部吸底区、上传、富文本、支付、客服、授权等能力时，回到 `mp-framework.md` 或命中的集中 Skill。

---

## 2. P0 强约束（Must）

### 2.1 页面骨架

- 页面根节点必须使用 `.page-container`；页面背景色只写在非 `scoped` 的 `page {}` 中，不写进页面根容器。
- `.page-container` 禁止设置 `height`、`min-height`。
- `definePage` 只承接页面级配置：标题、导航样式、下拉刷新、首页标记、免登录标记等；不要在页面里散写生成物配置。

### 2.2 导航承接

- 命中自定义 `navbar` 语义时，必须优先复用项目 `Navbar` 组件承接。
- 未命中自定义 `navbar` 语义时，必须补齐原生导航配置，至少包含 `navigationBarTitleText`；若设计稿给出明确顶部视觉，还需同步补齐 `navigationBarBackgroundColor`、`navigationBarTextStyle`。
- 自定义 `navbar` 判定优先依据当前页面 DSL 与截图：顶部区域若存在透明叠加、内容压入顶部背景、独立标题区、胶囊避让或非原生标题栏布局，则按自定义 `navbar` 处理。
- 命中自定义 `navbar` 时，属于顶部头区的品牌文案、页面主标题、头图区内操作区，必须并入 `Navbar` 承接范围。
- 若设计稿中顶部文案、品牌语、搜索框、头图区按钮位于状态栏/导航栏可视区域内，必须优先使用 `Navbar` 的 `left / center / right` 插槽承接。

### 2.3 模板、布局与样式职责

- 首屏布局必须优先用文档流容器承接；只有真实叠加、浮层、角标、装饰背景等明确覆盖关系，才允许使用 `absolute`。
- 页面样式必须默认写在 `scoped lang="scss"` 中，并以 `.page-container { 子块 }` 方式组织。
- 所有 `flex / flex-col / flex-row / flex-1 / grid / grid-cols-* / justify-* / items-* / content-* / gap-* / self-* / place-* / display / 定位流向` 这类布局语义，必须直接写在模板 `class` 中，由 UnoCSS 承接。
- SCSS 只允许承接颜色、字号、圆角、边距、背景、阴影等视觉样式；不要在 SCSS 中承接布局语义。
- 页面内一次性视觉样式默认直接写具体样式值；只有确实需要跨节点复用、动态切换或承接设计 token 时，才允许额外声明局部样式变量。
- `text` 节点默认沿用项目公共样式里的 `display: inline-block`；只有该节点确实需要单独改变显示方式时，才允许局部覆盖。
- class 命名必须保持简短，优先表达当前节点在父作用域内的直接语义；若样式已经收敛在父块作用域内，子节点优先使用 `icon`、`label`、`text`、`title` 这类短名，而不是 `card__icon`、`section-title__text` 这类重复父级语义的命名。
- 复用或替换页面内组件时，必须保留页面已有的外层 wrapper、sticky/fixed 边界、间距语义和数据适配；只在原有边界内部接入组件，不得把页面级间距转移为共享组件的全局副作用。
- 固定或浮动元素的位置必须由系统信息、安全区、TabBar 和实际相邻元素的尺寸推导；不得用单一设备的固定顶部或底部坐标拟合截图。
- 卡片操作区需要跨内容长度保持对齐时，必须通过容器的 flex 链和 `mt-auto` 等布局关系贴底；不得靠固定卡片高度实现。
- 图标、箭头等附属元素必须跟随实际文字宽度；长文案必须明确换行、截断或最大宽度策略，不得预留固定空槽。

### 2.5 模板直写与脚本抽取边界

- 页面内一次性静态文案、单个一次性跳转路径、一次性 class 名、一次性静态图片地址，必须默认直接写模板或调用处。
- 使用 `src/components/**` 下的组件时，直接在模板中使用；项目已自动注册，页面 `script` 中禁止明文 `import`，包括仅为 `InstanceType` 引入组件类型的情况。需要组件实例类型时，在页面声明最小 `defineExpose` 接口形状。
- `<template>` 注释仅用于项目内自定义组件调用，说明组件职责或关键边界；`uv-*` 等 UI 组件、Skill 组件、`uni_modules` 组件及 `view`、`text`、`image` 等原生结构标签不得添加此类注释。详细注释范围见 `mp-framework.md`。
- 只有会复用、承载状态，或需要被计算/切换的值，才允许提取到 `script`。
- 文字和内容块必须优先用自然内容流承接；不要为了对齐静态图随意给文本写固定宽高，也不要给承载真实数据的卡片强写固定高度。

### 2.6 页面内交互承接

- 页面层必须只负责当前页面结构、生命周期和局部交互承接；公共能力复用由 `mp-framework.md` 负责。
- 同一页面存在多个仅执行 `uni.navigateTo` 的入口时，必须在页面内集中声明类型受约束的 `pageRoutes`，并通过一个通用跳转函数承接；模板传入页面标识，不要为每个入口重复声明只含跳转语句的 `handleXxx`。涉及确认、埋点、接口请求或其他业务副作用的事件，仍应保留语义明确的独立处理函数。
- 首屏数据必须在 `onLoad` 完成路由参数校验后加载；`onShow` 仅承接页面可见性恢复、`refreshStore.consume(...)` 命中的跨页面刷新，或明确必要的状态恢复。
- PRD 中“页面显示时加载”“进入页面刷新”等描述，不得直接推导为每次 `onShow` 请求接口；常规数据刷新应由下拉刷新、显式用户操作或刷新标记承接。
- 页面内会触发异步副作用的常规操作，必须默认补齐 `tips.loading` / `tips.hideLoading` 或等价 loading 承接，避免用户连续点击触发重复提交。
- 右箭头必须统一使用 `<uv-icon name="arrow-right" />`。
- 弹层承载必须统一使用 `uv-popup`，并按项目页面写法组织插槽和关闭逻辑。

---

## 3. P0 禁止项（Must NOT）

- 原生 `button` 默认样式已由全局 `reset.scss` 统一处理；页面不得为了移除默认边框额外声明 `button::after`、`.button::after` 或同类覆盖。
- 不得在页面内重复实现导航高度、胶囊避让和滚动背景逻辑；命中自定义导航时，禁止只写 `navigationStyle: 'custom'` 后再手搓半套顶部占位。
- 不得把头区文案、品牌语、搜索框、标题、头图区按钮先写进 `page-content`，再靠 `margin-top`、负位移或额外占位块伪造成“在导航里”。
- 不得把一次性展示文案、固定入口配置、静态图片地址习惯性先提到 `script`。
- 不得在页面 `script` 中明文导入 `src/components/**` 下已自动注册的全局组件。
- 不得在 SCSS 中声明 `display: flex`、`grid-template-columns`、`justify-content`、`align-items`、`gap` 这类布局属性。
- 不得为了单页一次性配色、字号或背景，在页面样式顶部先声明一组局部 CSS 变量再转一层引用。
- 不得给页面里的 `text` 节点批量补 `display: block`；若确有显示方式差异，只能对必要节点单独覆盖。
- 不得让会触发异步副作用的常规操作裸奔执行；若没有 loading 锁定或等价防重入承接，视为页面交互缺口。
- 不得因 PRD 的“页面显示时加载”“进入页面刷新”等描述，在 `onShow` 中无条件请求接口。
- 不得在页面里为接口请求失败再额外补一层通用 `tips.toast` / `tips.error`；框架已统一承接失败提示，只有明确业务分支文案才允许单独提示。
- 不得仅因 PRD 写有登录判断、通用失败提示、免登录配置或鉴权忽略，就在页面补登录逻辑、失败反馈、`excludeLoginPath` 或 API `ignoreAuth`；这些配置必须以公共层或真实接口契约为依据。
- 不得把模板写成纯 class 容器，再把全部布局语义藏进 SCSS。
- 不得为了贴合静态图，对真实文本或真实数据卡片强写固定高度、固定宽度来硬凑版式。
- 不得以 UI-only、组件替换或视觉统一为由修改接口参数、请求时机、路由目标、默认展开状态、缓存恢复或既有业务分支。
- 不得删除页面原有 wrapper、sticky/fixed 容器或数据适配层后，把布局回归转嫁给共享组件的全局样式。

---

## 4. P1 推荐项（Should）

- 看到页面开发任务，第一反应先套页面骨架：`definePage + .page-container + page 背景 + scoped scss`。
- 看到设计稿顶部，第一反应先判断是原生导航还是自定义 `navbar`，而不是先写占位块。
- 看到顶部品牌文案、搜索框、标题或操作区压在头图区里，第一反应先放进 `Navbar` 插槽，而不是先塞进 `page-content`。
- 看到一次性展示文案、静态图片地址、单个一次性跳转，第一反应直接写模板或调用处，不先抽常量或配置对象。
- 看到同一页面有多个纯跳转入口，第一反应使用 `pageRoutes + navigateToPage` 集中管理，不先声明多个只含 `uni.navigateTo` 的事件函数。
- 看到父块内的一次性子节点 class，第一反应先用短名，不先写带父级前缀的长命名。
- 看到页面首屏结构，第一反应用文档流容器承接，不先写 `absolute` 布局。
- 看到 `flex / grid / gap / 对齐`，第一反应用 UnoCSS 布局类，不先把布局写进 SCSS。
- 看到单页内只用一次的颜色、背景或字号，第一反应直接写到样式声明里，不先抽局部 CSS 变量。
- 看到提交、删除、切换、复制、保存这类常规操作，第一反应先补 `tips.loading` 或等价防重复点击承接，而不是先裸调异步函数。
- 看到页面内的交互块、列表块、表单块，只负责页面结构与生命周期承接；具体公共能力优先交给 `mp-framework.md` 中的封装入口。

---

## 5. Few-shot 示例

### 5.1 原生导航页面骨架

正确：

```vue
<script lang="ts" setup>
import tips from '@/utils/tips'

definePage({
  style: {
    navigationBarTitleText: '订单详情',
  },
})

/** 订单ID */
const orderId = ref<number>()

/** 提交订单 */
function handleSubmit() {
  tips.toast('提交成功')
}
</script>

<template>
  <view class="page-container">
    <view class="content-card">
      <text class="title-text">订单详情</text>
      <uv-button type="primary" text="提交" @click="handleSubmit" />
    </view>
  </view>
</template>

<style>
page {
  background: #f7f8fa;
}
</style>

<style lang="scss" scoped>
.page-container {
  padding: 24rpx;

  .content-card {
    padding: 24rpx;
    background: #ffffff;
    border-radius: 16rpx;
  }

  .title-text {
    font-size: 28rpx;
    color: #222222;
  }
}
</style>
```

### 5.2 头区内容放进 Navbar 插槽

错误：

```vue
<template>
  <view class="page-container">
    <!-- Navbar：承接自定义导航区域 -->
    <Navbar :show-back="false" />

    <view class="page-content">
      <text class="brand-text">左侧内容</text>
    </view>
  </view>
</template>
```

正确：

```vue
<template>
  <view class="page-container">
    <!-- Navbar：承接导航标题、胶囊避让和滚动状态 -->
    <Navbar :show-back="false" :scroll-top="scrollTop">
      <template #left>
        <text class="brand-text">左侧内容</text>
      </template>

      <template #right>
        <view class="header-actions flex items-center gap-[16rpx]">
          <uv-icon name="search" size="32rpx" />
          <uv-icon name="more-dot-fill" size="32rpx" />
        </view>
      </template>
    </Navbar>

    <view class="page-content">
      <view class="content-card" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page-container {
  .brand-text {
    color: #333333;
    font-size: 30rpx;
    font-weight: 600;
  }

  .header-actions {
    color: #111111;
  }
}
</style>
```

### 5.3 Flex / Grid 布局写进模板 class

错误：

```vue
<template>
  <view class="page-container">
    <view class="entry-grid" />
  </view>
</template>

<style lang="scss" scoped>
.page-container {
  .entry-grid {
    display: flex;
    gap: 18rpx;
  }
}
</style>
```

正确：

```vue
<template>
  <view class="page-container">
    <view class="entry-grid flex gap-[18rpx]">
      <view class="main-card" />

      <view class="side-list flex flex-1 flex-col gap-[20rpx]">
        <view class="side-card" />
        <view class="side-card" />
      </view>
    </view>

    <view class="quick-entry-list flex justify-between">
      <view class="quick-entry-item" />
      <view class="quick-entry-item" />
      <view class="quick-entry-item" />
      <view class="quick-entry-item" />
    </view>

    <view class="template-grid grid grid-cols-2 gap-x-[18rpx] gap-y-[24rpx]">
      <view class="template-card" />
      <view class="template-card" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page-container {
  .main-card,
  .side-card,
  .template-card {
    border-radius: 20rpx;
    background: #ffffff;
  }

  .quick-entry-item {
    width: 120rpx;
  }
}
</style>
```

### 5.4 一次性静态配置直接写模板

错误：

```vue
<script lang="ts" setup>
const actionItems = [
  { label: '联系客服', icon: '/static/service.png' },
]
</script>
```

正确：

```vue
<template>
  <view class="quick-entry">
    <image class="icon" src="/static/service.png" />
    <text class="label">联系客服</text>
  </view>
</template>
```

### 5.5 生命周期分工

正确：

```typescript
/** 详情ID */
const detailId = ref<number>()

onLoad((options) => {
  if (!options.id) {
    tips.toast('缺少详情ID')
    setTimeout(() => {
      uni.navigateBack()
    }, 300)
    return
  }

  detailId.value = Number(options.id)
  fetchDetail()
})

onShow(() => {
  if (refreshStore.consume('/pages/order/detail')) {
    fetchDetail()
  }
})

onPullDownRefresh(async () => {
  tips.loading()
  try {
    await fetchDetail()
    tips.toast('刷新成功')
  } finally {
    tips.hideLoading()
    uni.stopPullDownRefresh()
  }
})
```

### 5.6 多入口页面跳转集中管理

错误：

```typescript
function handleGuide() {
  uni.navigateTo({ url: '/pages/guide/index' })
}

function handleOrderList() {
  uni.navigateTo({ url: '/pages/order/list' })
}

function handlePerformanceSchedule() {
  uni.navigateTo({ url: '/pages/guide/index?flow=schedule' })
}
```

正确：

```vue
<script lang="ts" setup>
const pageRoutes = {
  guide: '/pages/guide/index',
  orderList: '/pages/order/list',
  performanceSchedule: '/pages/guide/index?flow=schedule',
} as const

type PageRoute = keyof typeof pageRoutes

function navigateToPage(page: PageRoute) {
  uni.navigateTo({ url: pageRoutes[page] })
}
</script>

<template>
  <view>
    <view @click="navigateToPage('guide')">项目介绍</view>
    <view @click="navigateToPage('orderList')">我的订单</view>
    <view @click="navigateToPage('performanceSchedule')">演出时间表</view>
  </view>
</template>
```

存在确认、埋点或接口请求时，独立事件函数应承接这些副作用，再调用 `navigateToPage(...)`。

---

## 6. 输出前自检（必须执行）

在输出代码前，必须逐条自查：

- [ ] 是否使用 `.page-container`
- [ ] 是否把页面背景写在非 `scoped` 的 `page {}`
- [ ] 是否正确判断原生导航 / 自定义 `Navbar`
- [ ] 是否把头区内容放进 `Navbar` 承接范围，而不是伪造头部
- [ ] 是否把 `flex / grid / gap / 对齐` 布局语义写进模板 `class`
- [ ] 是否避免在 SCSS 中声明布局语义
- [ ] 是否避免为一次性视觉样式额外声明局部 CSS 变量
- [ ] 是否避免给 `text` 节点批量覆盖 `display: block`
- [ ] 是否给常规异步操作补齐了 `tips.loading` 或等价防重复点击承接
- [ ] 是否避免为接口失败补重复的通用提示
- [ ] 是否避免把一次性静态文案、图片地址、单个一次性跳转习惯性提到 `script`
- [ ] 多个纯跳转入口是否通过类型受约束的 `pageRoutes + navigateToPage` 集中管理
- [ ] 是否让 class 命名保持短名，不重复拼接父级前缀
- [ ] 是否让真实文本和真实数据卡片优先走自然内容流
- [ ] 是否只在必要的状态恢复或刷新标记命中时于 `onShow` 刷新数据
- [ ] `<template>` 中是否仅在项目内自定义组件调用前补了说明职责或关键边界的 `<!-- ... -->` 中文注释
- [ ] 是否把超出页面职责的公共能力回退到 `mp-framework.md`

最终说明中，建议至少显式给出：

- `pass_rules`
- `violated_rules`
- `residual_risks`

---

## 7. 补充口径

- 静态展示图若参与运行时渲染，资源来自 `static/ignore + VITE_IMAGE_HOST`，不要引用 `static/design`。
- 页面里若出现底部固定操作区、分页列表、上传区、富文本区，不在本文件重复定义复用方式，直接回到 `mp-framework.md` 或对应集中 Skill 选择能力。
