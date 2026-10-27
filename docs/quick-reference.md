# 快速参考

当前模板已精简为微信小程序个人开发底座。先复用现有能力，再新增业务代码。

## 环境配置

在 `env/.env.local` 中配置微信 AppID 和后端根地址：

```dotenv
VITE_WX_APPID='wx-your-appid'
VITE_SERVER_BASEURL='https://api.example.com/api'
```

请求层只读取 `VITE_SERVER_BASEURL`，不会固定指向模板域名；未配置时使用当前环境的相对地址。

## 公共能力

| 需求 | 入口 |
| --- | --- |
| HTTP 请求 | `src/http/alova.ts`、`src/api/<module>/index.ts` |
| 提示、弹窗、Loading | `src/utils/tips.ts` |
| 本地缓存 | `src/utils/storage.ts` |
| 登录态与 Token | `src/store/user.ts`、`src/utils/token.ts` |
| 本地分享配置 | `src/store/app.ts` 的 `shareConfig` |
| 导航栏 | `src/components/navbar/navbar.vue` |
| 日志 | `src/utils/logger.ts` |
| 平台与路由工具 | `src/utils/platform.ts`、`src/utils/index.ts` |

## 业务模块

| 类型 | 入口 |
| --- | --- |
| API | `src/api/user/`、`src/api/upload/` |
| Store | `src/store/app.ts`、`src/store/user.ts`、`src/store/refresh.ts` |
| 页面 | `src/pages/<module>/<name>.vue` |
| 分包页面 | `src/subpackages/watermark/` |

`src/api/upload/` 和 `src/subpackages/watermark/` 只有在项目需要图片上传或水印功能时才保留。

## 新增代码位置

| 类型 | 路径 | 命名 |
| --- | --- | --- |
| 页面 | `src/pages/<module>/<name>.vue` | `definePage` |
| 分包页面 | `src/subpackages/<package>/<name>.vue` | 在 `vite.config.ts` 注册分包 |
| 组件 | `src/components/<name>/<name>.vue` | 目录与文件同名 |
| 接口 | `src/api/<module>/index.ts` | `fetchXxx` |
| 类型 | `src/api/<module>/types.ts` | `<Module>Types` namespace |
| Store | `src/store/<name>.ts` | `useXxxStore` |
| 工具 | `src/utils/<name>.ts` | 按职责拆分 |

## 构建命令

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | 微信小程序开发构建 |
| `pnpm dev:test` | 微信小程序测试环境开发构建 |
| `pnpm dev:prod` | 微信小程序生产配置开发构建 |
| `pnpm build` | 微信小程序生产构建 |
| `pnpm type-check` | TypeScript 类型检查 |
| `pnpm lint` | ESLint 检查 |

开发产物位于 `dist/dev/mp-weixin`，生产产物位于 `dist/build/mp-weixin`。
