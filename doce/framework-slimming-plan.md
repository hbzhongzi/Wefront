# 微信小程序个人开发框架精简方案

## 目标

将通用 uni-app 模板收敛为个人微信小程序开发底座：只维护 `mp-weixin` 构建链路，保留登录、请求、状态管理和当前业务需要的水印能力，移除低频通用模块。

## 已落地内容

### 已删除的源码模块

- API：`common`、`expiry`、`feedback`、`kv`、`platform`、`tracking`
- 组件：`ad`、`add-miniprogram`、`fixed-bottom-wrapper`、`subscribe-popup`
- 页面与分包：`src/pages/web/web.vue`、`src/subpackages/template/`
- 工具：`src/utils/report.ts`、`src/utils/lodash.ts`

### 已完成的运行时调整

- 删除启动时埋点、远程应用配置和远程分享配置请求。
- `src/store/app.ts` 改用本地静态 `shareConfig`。
- 首页和个人页移除已删除组件的引用。
- `vite.config.ts` 与 `pages.config.ts` 只保留 `watermark` 分包。
- `src/utils/index.ts` 仅保留路由拦截所需工具。

### 已完成的构建与依赖调整

- `package.json` 仅保留微信小程序依赖和脚本。
- 移除 H5 代理、构建时间注入、构建分析以及其他平台依赖。
- 默认构建目标已统一为 `mp-weixin`，具体命令统一记录在 `docs/framework-handling.md`。
- `docs/quick-reference.md`、`docs/framework-handling.md`、`docs/README.md`、`README.md` 已同步更新。
- `doce/framework-overview.md` 与本文件统一记录框架优化和精简结果。

## 请求地址策略

请求层不再固定指向 `https://mini-tools.hnfuhua.cn/` 或任何模板域名。`src/http/alova.ts` 读取环境变量：

```dotenv
VITE_SERVER_BASEURL='https://api.example.com/api'
```

未配置时使用当前环境的相对地址；测试和生产环境通过 `env/.env.test`、`env/.env.production` 或对应的 `.local` 文件覆盖。

## 当前保留结构

```text
src/
  api/user/       # 用户与登录
  api/upload/     # 图片上传
  components/     # 当前保留 navbar
  http/           # Alova 请求层
  pages/          # 首页、个人页等主包页面
  router/         # 路由拦截
  store/          # app、user、refresh
  subpackages/
    watermark/    # 水印编辑
  utils/          # storage、token、tips、logger 等基础工具
```

## 后续按业务删除

以下能力仍可按具体项目继续移除，但必须连同引用、依赖和页面入口一起处理：

- 不需要登录时：删除 `src/api/user/`、`src/store/user.ts` 和登录拦截配置。
- 不需要上传或水印时：删除 `src/api/upload/`、`src/subpackages/watermark/` 及首页入口。
- 不需要自定义导航时：删除 `src/components/navbar/` 并改用原生导航栏。
- 不需要后端接口时：删除 `src/http/` 和业务 API，保留本地状态工具。

## 验收文档

部署、构建和验收命令统一维护在 [`docs/framework-handling.md`](../docs/framework-handling.md)，本文件只记录精简和优化结果。当前工作区未安装依赖时，类型检查和 lint 需要在安装依赖后执行。
