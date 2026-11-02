# 微信小程序框架总览

本文只记录当前源码可见的架构和模块职责。构建命令、环境配置和部署验收统一维护在 [`docs/framework-handling.md`](../docs/framework-handling.md)；问题及整改状态统一维护在 [`framework-optimization-audit.md`](./framework-optimization-audit.md)。

## 定位

项目源码采用 uni-app + Vue 3 + TypeScript，目标产品为微信小程序。当前页面源码包括首页、个人页和水印编辑分包；“今天穿什么”原型仍是独立 HTML，不属于已接入的小程序业务页。

## 启动与请求链路

```text
src/main.ts
  -> createSSRApp(App)
  -> Pinia、路由拦截、uv-ui、全局样式
  -> src/App.vue 应用生命周期与初始化
  -> 页面 -> src/api/<module> -> src/http/alova.ts
```

请求层从 `VITE_SERVER_BASEURL` 读取后端根地址，统一承接 Token、请求头、业务响应解包和错误处理。具体变量加载路径、mode 与构建器关系需以实际 Vite 配置为准；当前工作区根级构建配置缺失，见整体审计。

## 模块职责

| 路径 | 职责 |
| --- | --- |
| `src/pages/` | 主包页面与页面级交互编排 |
| `src/subpackages/watermark/` | 水印编辑功能 |
| `src/api/user/`、`src/api/upload/` | 用户及文件上传接口 |
| `src/http/` | Alova 请求实例及响应/错误处理 |
| `src/store/` | 应用、用户和跨页面刷新状态 |
| `src/router/` | 页面导航拦截、登录策略和跳转参数 |
| `src/components/` | 跨页面复用组件，目前包含 navbar |
| `src/utils/` | 缓存、Token、提示、日志、平台和系统信息等基础工具 |
| `src/tabbar/` | 原生/自定义 TabBar 配置与状态 |
| `env/` | 环境变量文件；是否被构建器读取需核对 `envDir` |

## 关键边界

- 页面负责布局和交互编排；接口通过 `src/api/`，不在页面拼接服务端 URL。
- 跨页面共享状态放 Store；短生命周期状态留在页面或组件。
- Token 和缓存复用现有工具，不在页面另建持久化机制。
- 主包/分包页面清单与生成文件由构建插件负责；生成路径应在恢复的构建配置中明确。
- 设计稿落地时先映射设计 Token 和页面结构；仅把稳定的跨页面模式抽为全局组件，避免把单页业务逻辑塞进底层框架。

当前可见源码问题及建议整改顺序详见[框架整体排查与优化建议](./framework-optimization-audit.md)。
