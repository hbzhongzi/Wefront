# 微信小程序构建与处理规范

本文档只适用于当前 uni-app + Vue 3 + TypeScript 微信小程序项目。所有路径均相对于小程序根目录。

## 1. 环境

- Node.js 20 或更高版本
- pnpm 10.x
- 微信开发者工具

先在项目根目录安装依赖：

```bash
pnpm install
```

## 2. Windows 启动

项目保留 `scripts/window-path-loader.js`，用于兼容 Windows 下 uni CLI 的 ESM 路径。正常使用 `package.json` 中的脚本即可，不要绕过脚本直接调用 `uni.js`。

```bash
pnpm dev
pnpm dev:test
pnpm dev:prod
pnpm build
pnpm build:test
pnpm build:prod
```

开发脚本会持续监听并输出构建结果，不是 H5 常驻开发服务器。看到构建完成日志后，检查 `dist/dev/mp-weixin`。

## 3. 命令表

| 命令 | 用途 | 产物 |
| --- | --- | --- |
| `pnpm dev` | 默认开发构建 | `dist/dev/mp-weixin` |
| `pnpm dev:test` | 测试环境开发构建 | `dist/dev/mp-weixin` |
| `pnpm dev:prod` | 生产配置开发构建 | `dist/dev/mp-weixin` |
| `pnpm build` | 默认生产构建 | `dist/build/mp-weixin` |
| `pnpm build:test` | 测试环境生产构建 | `dist/build/mp-weixin` |
| `pnpm build:prod` | 生产环境生产构建 | `dist/build/mp-weixin` |
| `pnpm type-check` | TypeScript 检查 | 无 |
| `pnpm lint` | ESLint 检查 | 无 |

按项目规则，日常不需要执行 `pnpm build:mp`。

## 4. 环境配置

环境文件位于 `env/`。至少配置：

```dotenv
VITE_WX_APPID='wx-your-appid'
VITE_SERVER_BASEURL='https://api.example.com/api'
```

`VITE_SERVER_BASEURL` 是可替换的后端根地址，代码不会固定使用模板域名。不同环境使用 `.env.test`、`.env.production` 及其 `.local` 覆盖文件。

## 5. 页面与分包验收

新增页面放在 `src/pages/<module>/<name>.vue`，分包页面放在 `src/subpackages/<package>/`，通过 `definePage` 声明页面配置。不要手动维护生成的 `src/pages.json`、`src/types/uni-pages.d.ts`、自动导入和组件类型文件。

当前唯一分包是 `watermark`。构建后在微信开发者工具中导入：

```text
<MINIPROGRAM_ROOT>\dist\dev\mp-weixin
```

至少检查首页、TabBar、个人页和水印页面能正常打开。

## 6. 故障排查

| 现象 | 处理 |
| --- | --- |
| `Received protocol 'd:'` | 确认通过 `package.json` 脚本启动，未直接调用 uni CLI |
| 命令持续运行 | 这是微信小程序监听构建；确认出现构建完成日志并检查产物目录 |
| 页面未生成 | 检查页面路径、`definePage` 和 UniPages 配置 |
| 请求地址错误 | 检查 `env/.env.*` 中的 `VITE_SERVER_BASEURL`，不要修改源码写死地址 |
| 类型检查找不到命令 | 先执行 `pnpm install`，再运行 `pnpm type-check` |
