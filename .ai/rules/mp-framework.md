# 公共能力复用规范

目标：用项目现有封装约束页面、组件、store、hooks、utils 的公共能力复用。页面骨架、导航判定和样式组织见 `mp-page.md`。

## 1. 适用范围

本文件只约束“已有公共能力应该优先复用什么”，重点回答以下问题：

- 页面里出现某类通用能力时，应该优先复用哪个组件、hook、store 或 utils
- 哪些公共能力禁止在页面或业务组件里重新散写
- 页面、组件、store、hooks、utils 接入公共能力时，最小代码边界是什么

本文件不负责页面骨架、导航判定、UnoCSS/SCSS 分工、class 命名和模板组织；这些回到 `mp-page.md`。

---

## 2. P0 强约束（Must）

### 2.1 导航、列表与固定区

- 导航能力必须优先复用 `src/components/navbar/navbar.vue`；不要在页面内重复实现导航高度、胶囊避让和滚动背景逻辑。
- 使用 `UniPages` 新增或调整分包时，只在 `vite.config.ts` 的 `UniPages` 配置中登记分包目录；不要在 `pages.config.ts` 声明分包页面。
- 页面标题、导航样式、下拉刷新、首页和免登录等页面级配置，只在页面文件的 `definePage` 中声明；不要修改 `pages.config.ts`。
- 修改路由或分包前，先核对项目实际的 `UniPages` 配置与页面发现机制；不得仅按配置文件名推断写入位置。
- 页面跳转参数包含中文、URL 保留字符或嵌套 URL 时，调用处必须对参数值使用 `encodeURIComponent`；不要编码页面路径或完整 URL。
- 分页/列表能力先读取集中 Skill `list`；接入后不要在页面内重新维护 `page_no`、`page_size`、`count`、`lists` 这套分页状态。
- 底部固定操作区先读取集中 Skill `fixed-bottom-wrapper`；接入组件后，页面根容器不要重复承接底部安全区。
- 分包使用的公共组件必须放置在对应分包路径内，例如 `src/subpackages/<package>/components/`；不得放置在全局 `src/components/` 目录内。

### 2.2 上传、提示与系统信息

- 多图上传或单资源普通上传先读取集中 Skill `upload`；接入后通过目标项目的 API 层收口上传参数和响应类型，不要页面内散写上传流程。
- 目标项目已有成熟上传组件或 Hook 时优先复用；需要不同上传能力时，通过其 `api` 参数或 API 适配层接入，不要重写上传流程。
- 远程上传必须使用服务端响应中约定的资源地址字段；缺失该字段时视为上传失败，不得以本地临时路径作为成功资源地址。
- 是否使用对象存储直传必须以服务端接口契约为准；不要仅因 PRD 未提及或提及上传就自行推断上传方式。
- 提示、确认和常规 Loading 必须统一走 `src/utils/tips.ts`；支付流程先读取 `payment` Skill，使用其中的全局 Loading，不要直接调用 `uni.showToast`、`uni.showModal`、`uni.showLoading` 承接业务反馈。
- 重要操作调用 `tips.confirm` 时，必须显式传递 `showCancel: true`，确保用户可见取消按钮。
- 系统信息、状态栏高度、胶囊信息等全局设备数据，必须优先复用项目已维护入口或封装；不要页面内重复调用系统 API 自行计算导航尺寸。

### 2.3 Store、缓存与刷新

- 跨页面刷新必须统一走 `refreshStore`。
- 本地缓存必须统一走 `useStorage()`。
- 用户状态必须统一走 `useUserStore()`。
- 应用全局状态必须统一走 `useAppStore()`。
- 小程序公共模块已在受保护页面进入前完成登录处理；业务页面进入时即视为已登录。即使 PRD 写有“前置登录校验”“确认登录”“未登录需要登录”“未登录引导”或“未登录不调用”，页面也必须忽略该描述，不得重复调用 `getUserToken()`、维护页面级登录态，或实现登录引导 UI。
- 用户信息以 `useUserStore().userInfo` 为准；页面不得频繁重复请求用户信息接口。更新单个用户字段后必须同步差量更新 Store；只有登录、绑定手机号等可能更新多个用户字段的操作后，才调用 `userStore.getUserInfo()` 重取完整信息。
- 头像昵称必须复用当前项目已有的资料页面、用户 Store 与服务端契约；不得仅按页面 PRD 改造资料同步或编辑流程。

### 2.4 路由参数驱动的首刷

- 页面首屏请求依赖路由参数时，必须在 `onLoad` 取得并校验参数后发起请求；不得用 Vue `onMounted` 代替页面 `onLoad` 承接路由参数首刷。
- 若请求必须通过模板 ref 调用组件实例，可在 `onLoad` 发起的异步函数中先 `await nextTick()`，再调用实例方法；`nextTick` 只用于等待 ref 就绪，不改变首刷由 `onLoad` 发起的责任边界。

```ts
/** 列表组件实例 */
const listRef = ref<{ handlePullDownRefresh: () => Promise<void> }>()

/** 路由参数就绪后首刷 */
async function loadInitial(): Promise<void> {
  await nextTick()
  await listRef.value?.handlePullDownRefresh()
}

/** 页面加载时校验路由参数并触发首刷 */
onLoad((options) => {
  const spotId = typeof options.spotId === 'string' ? options.spotId : ''
  if (!spotId) {
    return
  }

  void loadInitial()
})
```

### 2.5 富文本、画布与敏感能力

- 富文本能力按需读取 `mp-html` Skill，并将其中原始源码接入项目。
- 画布/海报能力按需读取 `lime-painter` Skill；交互式 LeaferJS 画布读取 `canvas-leafer` Skill。不要混用两套画布基础设施。
- 使用 `getLocation` 等微信权限 API 前，必须先读取集中 Skill `payment` 并接入其中的 `useAuthorize`；不要在页面内散写 `getSetting`、`authorize`、`openSetting` 调用链。
- 支付、客服、授权、订阅消息、广告等敏感/平台能力，必须优先复用项目既有工具和 Skill；不要页面内散写原生调用链。

### 2.6 注释与接入边界

- 修改组件、store、hooks、utils，或页面内公共能力接入逻辑时，所有新增业务声明都必须在声明或注册调用前补充 `/** ... */` 中文注释，不得仅为异步副作用函数或导出函数添加注释。
- 注释范围包括但不限于业务常量与变量、`ref` / `reactive` 状态、`computed` 计算属性、`watch` 监听器、组件实例、普通函数、异步函数、事件处理函数、生命周期回调，以及导出的函数、类型、接口和枚举。
- 注释必须说明业务职责或用途，不得只重复变量名、函数名或类型名；同一业务声明已有准确 `/** ... */` 注释时无需重复添加。
- `<template>` 注释仅用于项目内自定义组件（如 `src/components/**`、分包内 `components/**`）；新增或接入时，必须在调用前补充 `<!-- ... -->` 中文注释，说明组件职责或关键边界。`uv-*` 等 UI 组件、Skill 组件、`uni_modules` 组件和 `view`、`text`、`image` 等原生结构标签不得添加此类注释。
- 自定义组件注释应紧邻组件调用；组件存在嵌套时，外层和内层自定义组件分别按职责注释，不得用一条笼统注释覆盖多个职责不同的组件。

### 2.7 服务端数据与失败语义

- 先按请求职责区分失败语义：仅直接影响用户主流程、且失败未由公共层统一承接的业务请求，才必须保留明确的错误态、空态或用户可操作的重试入口；不得伪造业务成功结果、权限状态或服务端数据。
- 埋点、日志、曝光等非关键副作用接口必须静默执行：无论成功或失败均不得提示用户、不得阻断主流程、不得因此增加页面级重试入口。单条事件未被接收时，可按接口契约保留诊断上下文；除非接口契约明确要求，不得将其推导为页面自动重试或用户可见的失败处理。
- 不得以静态业务数据、本地临时路径或猜测字段替代服务端返回结果。
- PRD 描述的通用登录、通用请求失败提示等已由公共层承接时，页面必须标记为框架已覆盖，不得重复实现。普通请求的失败提示已由 Alova 等公共请求层承接时，页面不得再次提示；页面仅为恢复自身状态而捕获异常时，也不得重复展示提示。PRD 与公共层或真实服务端契约冲突时，优先以公共层和服务端为准。
- 审查或输出建议前，必须先完成上述职责分类；不得仅因请求失败、`accepted=false` 或事件级 `error`，建议为埋点接口增加用户提示、页面级重试或把公共层提示再实现一遍。

### 2.8 公共能力迁移边界

- 接入共享组件前，必须先检查同类页面的调用方式、页面 wrapper、请求状态和 adapter；复用组件不等于删除页面局部结构或数据转换。
- 临时 mock、fallback ID、DEV 分支、API bypass 和替代交互只能用于用户明确要求的局部检视；恢复真实数据时必须连同开关和替代路径一并删除。
- 跨页面广告位、环境条件等配置必须由项目统一配置入口消费；页面只负责当前位置、局部间距和状态承接，不得硬编码共享资源标识。

---

## 3. P0 禁止项（Must NOT）

- 不得在页面内重写导航高度、胶囊避让、滚动背景透明度等已有导航逻辑。
- 不得在页面内自行维护分页列表的整套分页状态。
- 不得在页面内散写上传、提示、Loading、确认框的原生调用链。
- 不得在页面或组件里自行计算系统状态栏高度、胶囊信息等全局设备数据。
- 不得绕过 `store` / `useStorage` / `refreshStore` 现有入口，在页面里重新拼一套缓存、登录态或跨页面刷新机制。
- 不得在业务页面重复确认登录、调用登录方法或实现登录失败/重试界面；登录由公共模块统一承接。
- 不得绕过 `useUserStore()` 频繁请求用户信息接口，或在用户字段变更后只更新页面局部状态、不同步 Store。
- 不得在页面内散写微信权限 API 的授权引导链路，或未按 `payment` Skill 接入 `useAuthorize` 就直接调用权限 API。
- 不得在页面里散写支付、客服、授权、订阅消息、广告等敏感能力的原生调用流程。
- 不得用 Vue `onMounted` 读取路由参数或代替 `onLoad` 发起依赖路由参数的首次数据请求。
- 不得在远程上传响应缺少资源地址时回退使用本地临时路径，或为接口失败硬编码业务 fallback 结果。
- 不得因组件复用而删除页面已有的 wrapper、adapter、请求状态或恢复逻辑，再向共享组件添加仅服务单页的全局补偿样式。
- 不得将 mock、fallback ID、临时 timeout、DEV 分支或 API bypass 留在生产业务路径。

---

## 4. P1 推荐项（Should）

- 看到导航，第一反应先想 `Navbar`。
- 看到分页列表，第一反应先检查 `list` Skill。
- 看到底部吸底按钮区，第一反应先检查 `fixed-bottom-wrapper` Skill。
- 看到多图上传或单资源普通上传，第一反应先检查 `upload` Skill。
- 看到提示、确认、Loading，第一反应先想 `tips`。
- 看到缓存、登录态、应用配置、系统信息，第一反应先想 `store` 或 `utils` 现成入口。
- 看到富文本、海报、支付、客服、订阅消息，第一反应先查 `docs/quick-reference.md` 和现有 Skill，不先散写原生能力。

---

## 5. Few-shot 示例

### 5.1 分页列表

正确：

```typescript
/** 列表组件实例 */
const listRef = ref()

/** 页面触底时加载下一页 */
onReachBottom(() => listRef.value?.handleReachBottom())

/** 下拉刷新当前列表 */
onPullDownRefresh(async () => {
  tips.loading()
  try {
    await listRef.value?.handlePullDownRefresh()
    tips.toast('刷新成功')
  } finally {
    tips.hideLoading()
    uni.stopPullDownRefresh()
  }
})
```

```vue
<template>
  <view class="page-container">
    <List ref="listRef" :api="fetchOrderList" :params="{ status }" />
  </view>
</template>
```

### 5.2 导航与吸底区

正确：

```typescript
/** 当前页面滚动距离 */
const scrollTop = ref(0)

/** 页面滚动时同步导航栏透明度依据 */
onPageScroll((event) => {
  scrollTop.value = event.scrollTop
})
```

```vue
<template>
  <view class="page-container">
    <!-- Navbar：承接页面标题和滚动状态，不在页面重复实现导航高度 -->
    <Navbar title="订单详情" :scroll-top="scrollTop" />

    <FixedBottomWrapper>
      <uv-button type="primary" text="提交订单" />
    </FixedBottomWrapper>
  </view>
</template>
```

### 5.3 Store、缓存与刷新

正确：

```typescript
/** 用户状态 */
const userStore = useUserStore()

/** 应用全局状态 */
const appStore = useAppStore()

/** 页面缓存 */
const cache = useStorage('order')

/** 跨页面刷新标记 */
const refreshStore = useRefreshStore()

/** 状态栏高度 */
const statusBarHeight = computed(() => appStore.systemInfo?.statusBarHeight || 0)

cache.set('draft', form.value)
refreshStore.mark('pages/order/list')

/** 页面显示时消费跨页面刷新标记 */
onShow(() => {
  if (refreshStore.consume('pages/order/list')) {
    listRef.value?.reload()
  }
})
```

### 5.4 上传、富文本与第三方能力

正确：

```vue
<template>
  <view class="page-container">
    <Upload v-model="images" :max-count="9" />
  </view>
</template>
```

### 5.5 提示与 Loading

错误：

```typescript
uni.showToast({
  title: '提交成功',
  icon: 'none',
})
```

正确：

```typescript
tips.toast('提交成功')
```

---

## 6. 输出前自检（必须执行）

在输出代码前，必须逐条自查：

- [ ] 是否优先复用了 `Navbar`，并在需要分页、普通上传或吸底操作区时读取 `list` / `upload` / `fixed-bottom-wrapper` Skill
- [ ] 是否统一使用 `tips` 承接提示、确认和 Loading
- [ ] 重要操作调用 `tips.confirm` 时，是否显式传递了 `showCancel: true`
- [ ] 是否复用了现有系统信息入口，而不是自己调用系统 API 计算
- [ ] 是否把缓存、用户状态、应用状态、跨页面刷新分别交给 `useStorage` / `useUserStore` / `useAppStore` / `refreshStore`
- [ ] 是否避免重复请求用户信息，并在单字段更新后同步差量更新 `userStore`
- [ ] 是否在调用微信权限 API 前读取 `payment` Skill 并接入 `useAuthorize`
- [ ] 是否按多图或单资源上传场景复用了 `upload` Skill 或项目已有等价能力
- [ ] 是否避免为上传或接口失败硬编码本地路径、静态数据或业务结果 fallback
- [ ] 是否已区分主流程业务请求与埋点、日志、曝光等静默副作用请求，并使用对应失败语义
- [ ] 是否避免为静默副作用接口增加用户提示或页面级重试，并避免重复承接 Alova 等公共请求层的失败提示
- [ ] 是否把富文本、画布、海报回退到现有 `uni_modules`
- [ ] 是否避免在页面里散写支付、客服、授权、订阅消息、广告等敏感能力
- [ ] 所有新增业务声明是否都补了说明职责或用途的 `/** ... */` 中文注释
- [ ] `<template>` 中是否只在项目内自定义组件调用前补了说明职责或关键边界的 `<!-- ... -->` 中文注释

最终说明中，建议至少显式给出：

- `pass_rules`
- `violated_rules`
- `residual_risks`

---

## 7. 补充口径

- `mp-page.md` 负责页面产出形态；本文件只负责“已有公共能力应该优先复用什么”。
- 当页面里同时涉及页面骨架与公共能力时，两份规则默认同时生效：页面结构回 `mp-page.md`，能力选型回本文件。
