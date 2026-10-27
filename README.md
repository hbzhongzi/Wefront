# 微信小程序个人开发底座

这是一个基于 uni-app、Vue 3 和 TypeScript 的微信小程序项目模板，已按个人开发场景完成精简。项目只维护微信小程序构建链路，不内置固定的后端域名。

仓库地址：[github.com/hbzhongzi/Wefront](https://github.com/hbzhongzi/Wefront)

当前版本面向个人微信小程序开发，默认保留用户登录、接口请求、图片上传和水印编辑能力；广告、埋点、订阅、反馈及其他平台构建能力已移除。

## 技术栈

- uni-app + Vue 3 + TypeScript
- Vite + pnpm
- Pinia + `pinia-plugin-persistedstate`
- Alova + `@alova/adapter-uniapp`
- uv-ui、UnoCSS、SCSS
- 微信小程序平台：`mp-weixin`

## 目录

```text
src/
  api/user/       # 用户与登录接口
  api/upload/     # 上传接口，水印功能使用
  components/     # 当前保留 navbar
  http/           # Alova 请求实例与鉴权
  pages/          # 主包页面
  router/         # 路由拦截与登录策略
  store/          # app、user、refresh
  subpackages/    # 当前保留 watermark 分包
  utils/          # storage、token、tips 等基础工具
docs/             # 当前架构与开发规范
doce/             # 精简方案与落地记录
env/              # 环境变量
```

部署、环境变量、构建命令和微信开发者工具导入方式统一记录在 [`docs/`](./docs/) 中。请求根地址使用 `VITE_SERVER_BASEURL` 动态配置，不内置固定域名。

## 文档入口

- [快速参考](./docs/quick-reference.md)
- [构建与处理规范](./docs/framework-handling.md)
- [框架优化总览](./doce/framework-overview.md)
- [精简方案与落地结果](./doce/framework-slimming-plan.md)

项目不要求日常执行 `pnpm build:mp`；按本目录 `AGENTS.md` 的约定，使用 `pnpm dev` 或 `pnpm build` 验证微信小程序即可。
