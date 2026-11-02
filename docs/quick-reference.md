# 快速参考

当前底座面向微信小程序（uni-app + Vue 3 + TypeScript）。本页只做代码入口索引；构建、环境变量和部署步骤统一见 [`framework-handling.md`](./framework-handling.md)，架构和整改计划见 [`doce/framework-overview.md`](../doce/framework-overview.md) 与 [`doce/framework-optimization-audit.md`](../doce/framework-optimization-audit.md)。

## 公共能力入口

| 需求 | 入口 |
| --- | --- |
| HTTP 请求与响应处理 | `src/http/alova.ts`、`src/api/<module>/index.ts` |
| Token 与用户状态 | `src/utils/token.ts`、`src/store/user.ts` |
| 应用与分享状态 | `src/store/app.ts` |
| 跨页面刷新标记 | `src/store/refresh.ts` |
| 提示、弹窗、Loading | `src/utils/tips.ts` |
| 本地缓存 | `src/utils/storage.ts` |
| 导航栏 | `src/components/navbar/navbar.vue` |
| 平台、路由与系统信息 | `src/utils/`、`src/router/` |
| 日志 | `src/utils/logger.ts` |

## 目录约定

| 类型 | 路径 |
| --- | --- |
| 主包页面 | `src/pages/<module>/<name>.vue` |
| 分包页面 | `src/subpackages/<package>/<name>.vue` |
| 组件 | `src/components/<name>/<name>.vue`；仅跨页面复用时放全局目录 |
| 接口与类型 | `src/api/<module>/index.ts`、`types.ts` |
| Store | `src/store/<name>.ts` |
| 通用工具 | `src/utils/<name>.ts` |

页面和分包发现规则以恢复后的实际 Vite/UniPages 配置为准；当前工作区配置缺失情况及影响见[整体审计](../doce/framework-optimization-audit.md)。
