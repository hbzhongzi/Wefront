# 微信小程序框架总览

本文档记录精简后的当前架构，属于框架更新与优化文档，统一归档在 `doce/`。路径均相对于小程序根目录。

## 1. 定位

项目是面向个人开发的微信小程序底座，使用 uni-app + Vue 3 + TypeScript。构建目标固定为 `mp-weixin`，不再维护 H5、App 或其他小程序平台适配层。

请求服务地址不写死在源码中：`src/http/alova.ts` 从 `VITE_SERVER_BASEURL` 读取根地址，未配置时使用当前环境的相对地址。

## 2. 启动链路

```text
src/main.ts
  -> createSSRApp(App)
  -> Pinia、路由拦截、uv-ui、全局样式
  -> 页面生命周期
  -> src/api/*
  -> src/http/alova.ts
```

`src/App.vue` 负责应用级生命周期和基础初始化。`src/store/app.ts` 保存应用信息、启动参数、系统信息和本地分享配置；分享配置不再请求远程平台接口。

## 3. 目录与职责

| 路径 | 职责 |
| --- | --- |
| `src/pages/` | 主包页面，目前包含首页和个人页 |
| `src/subpackages/watermark/` | 图片水印编辑分包 |
| `src/api/user/` | 用户初始化、登录相关接口 |
| `src/api/upload/` | 图片上传接口 |
| `src/http/alova.ts` | 请求根地址、Token、统一响应处理 |
| `src/store/app.ts` | 应用信息、系统信息、本地分享配置 |
| `src/store/user.ts` | 用户信息与登录态 |
| `src/store/refresh.ts` | 跨页面刷新标记 |
| `src/router/` | 路由拦截、登录策略和跳转参数 |
| `src/components/navbar/` | 可复用导航栏 |
| `src/utils/` | storage、token、提示、日志和路由辅助函数 |
| `pages.config.ts` | 页面、TabBar 与分包配置 |
| `vite.config.ts` | 微信构建、自动导入、组件和页面扫描 |

## 4. 页面与分包

页面使用 `definePage` 声明页面配置，UniPages 自动生成路由相关文件。当前只有一个业务分包：

```text
src/subpackages/watermark/
```

新增分包时，同时在 `vite.config.ts` 的 `UniPages({ subPackages })` 中登记；部署和产物验收流程见 [`docs/framework-handling.md`](../docs/framework-handling.md)。

## 5. 请求层

业务页面通过 `src/api/<module>/index.ts` 调用请求，不直接拼接 URL 或调用 `uni.request`。

```ts
import { http } from '@/http/alova'

export const fetchUser = () => http.Get('/user')
```

请求层提供：

- `VITE_SERVER_BASEURL` 动态根地址
- Token 读取和刷新
- `meta.ignoreAuth` 跳过鉴权
- `{ code, msg, data }` 响应解包
- 上传请求类型支持

当前 API 模块只有 `user` 和 `upload`。后续新增接口时按模块建立 `index.ts` 与 `types.ts`。

## 6. 状态与导航

- Pinia 负责应用、用户和刷新状态。
- 用户 Token 通过现有 storage/token 工具持久化。
- 路由拦截器统一处理登录校验、TabBar 跳转和 redirect 参数。
- TabBar 使用微信原生配置；页面级导航使用 `navbar` 组件时再引入。

## 7. 已移除能力

精简后不再包含广告、订阅引导、埋点上报、反馈、有效期、通用键值服务、动态平台配置、网页容器和模板示例分包，也不再保留 H5 代理及其他平台构建脚本。需要这些能力时，应按具体业务重新设计并接入，而不是恢复通用模板代码。
